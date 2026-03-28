"use client";

import { useCallback, useMemo, useState } from "react";

import type { IChatTransport } from "@/lib/chat/chat-transport";
import { MockChatTransport } from "@/lib/chat/mock-chat-transport";
import type { ChatMessage } from "@/types/chat";

function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export interface UseChatOptions {
  readonly transport?: IChatTransport;
}

export interface UseChatResult {
  readonly messages: readonly ChatMessage[];
  readonly isStreaming: boolean;
  readonly error: string | null;
  readonly sendMessage: (text: string) => Promise<void>;
  readonly clearError: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
  const transport = useMemo(
    () => options.transport ?? new MockChatTransport(),
    [options.transport]
  );
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || isStreaming) {
        return;
      }
      setError(null);
      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
        status: "complete",
      };
      const assistantId = createMessageId();
      const assistantShell: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        status: "streaming",
      };
      setMessages((prev) => [...prev, userMessage, assistantShell]);
      setIsStreaming(true);
      try {
        for await (const chunk of transport.streamAssistantReply({
          userText: trimmed,
        })) {
          setMessages((prev) => {
            const next = [...prev];
            const idx = next.findIndex((m) => m.id === assistantId);
            if (idx === -1) {
              return prev;
            }
            const current = next[idx];
            if (!current) {
              return prev;
            }
            next[idx] = {
              ...current,
              content: current.content + chunk,
              status: "streaming",
            };
            return next;
          });
        }
        setMessages((prev) => {
          const next = [...prev];
          const idx = next.findIndex((m) => m.id === assistantId);
          if (idx === -1) {
            return prev;
          }
          const current = next[idx];
          if (!current) {
            return prev;
          }
          next[idx] = { ...current, status: "complete" };
          return next;
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setMessages((prev) => {
          const next = [...prev];
          const idx = next.findIndex((m) => m.id === assistantId);
          if (idx === -1) {
            return prev;
          }
          const current = next[idx];
          if (!current) {
            return prev;
          }
          next[idx] = { ...current, status: "error" };
          return next;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, transport]
  );

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearError,
  };
}
