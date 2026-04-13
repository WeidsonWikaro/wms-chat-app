"use client";

import type { Socket } from "socket.io-client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  appendAssistantChunk,
  markAssistantComplete,
} from "@/lib/chat/chat-stream-utils";
import {
  CHAT_EVENT_CHUNK,
  CHAT_EVENT_COMPLETE,
  CHAT_EVENT_ERROR,
  CHAT_EVENT_MESSAGE_RECEIVED,
  CHAT_EVENT_SEND,
  CHAT_EVENT_SESSION,
  CHAT_MAX_MESSAGE_LENGTH,
  type ChatChunkPayload,
  type ChatCompletePayload,
  type ChatErrorPayload,
  type ChatMessageReceivedPayload,
  type ChatSendPayload,
  type ChatSessionPayload,
  type ChatSocketHandlers,
} from "@/lib/socket/chat-protocol";
import type { ChatMessage } from "@/types/chat";

function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createdAtFromOptionalSentAt(sentAt: string | undefined): number {
  if (sentAt === undefined) {
    return Date.now();
  }
  const parsed = Date.parse(sentAt);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function resolveWelcomeTextFromSession(
  payload: ChatSessionPayload
): string | null {
  const raw =
    payload.welcomeMessage?.trim() ?? payload.message?.trim() ?? "";
  return raw.length > 0 ? raw : null;
}

export interface UseChatOptions {
  readonly socket?: Socket | null;
  readonly socketReady?: boolean;
  /**
   * Regista handlers no socket assim que a instância existe (evita perder saudação
   * do servidor em corrida com `connect`). Se omitido, usa `socket.on` em `useLayoutEffect`.
   */
  readonly subscribeChatHandlers?: (
    handlers: ChatSocketHandlers
  ) => () => void;
}

export interface UseChatResult {
  readonly messages: readonly ChatMessage[];
  readonly isStreaming: boolean;
  readonly error: string | null;
  readonly sendMessage: (text: string) => Promise<void>;
  readonly clearError: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
  const {
    socket = null,
    socketReady = false,
    subscribeChatHandlers,
  } = options;

  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationIdRef = useRef<string | null>(null);
  const activeClientMessageIdRef = useRef<string | null>(null);
  const lastSocketRef = useRef<Socket | null>(null);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useLayoutEffect(() => {
    if (!socket) {
      lastSocketRef.current = null;
      return;
    }

    const resetConversationForNewSocketSession = (): void => {
      setConversationId(null);
      conversationIdRef.current = null;
    };

    const isNewSocketInstance = lastSocketRef.current !== socket;
    lastSocketRef.current = socket;
    if (isNewSocketInstance) {
      resetConversationForNewSocketSession();
      queueMicrotask(() => {
        setMessages([]);
      });
    }

    const handleSession = (payload: ChatSessionPayload): void => {
      setConversationId(payload.conversationId);
      conversationIdRef.current = payload.conversationId;
      const welcomeText = resolveWelcomeTextFromSession(payload);
      if (welcomeText === null) {
        return;
      }
      setMessages((prev) => {
        const welcomeId = `welcome-${payload.conversationId}`;
        if (prev.some((m) => m.id === welcomeId)) {
          return prev;
        }
        const welcomeMessage: ChatMessage = {
          id: welcomeId,
          role: "assistant",
          content: welcomeText,
          createdAt: createdAtFromOptionalSentAt(payload.sentAt),
          sentAtIso: payload.sentAt,
          status: "complete",
          authorName: "Assistente WMS",
        };
        return [...prev, welcomeMessage];
      });
    };

    const handleMessageReceived = (
      payload: ChatMessageReceivedPayload
    ): void => {
      setConversationId(payload.conversationId);
      conversationIdRef.current = payload.conversationId;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== payload.clientMessageId || m.role !== "user") {
            return m;
          }
          return {
            ...m,
            sentAtIso: payload.sentAt,
            createdAt: createdAtFromOptionalSentAt(payload.sentAt),
          };
        })
      );
    };

    const handleChunk = (payload: ChatChunkPayload): void => {
      const cid = payload.conversationId;
      if (typeof cid === "string" && cid.length > 0) {
        conversationIdRef.current = cid;
        setConversationId((prev) => (prev === cid ? prev : cid));
      }
      setMessages((prev) => appendAssistantChunk(prev, payload));
    };

    const handleComplete = (payload: ChatCompletePayload): void => {
      setMessages((prev) => markAssistantComplete(prev, payload));
      setIsStreaming(false);
      activeClientMessageIdRef.current = null;
    };

    const handleChatError = (payload: ChatErrorPayload): void => {
      setError(payload.message);
      setIsStreaming(false);
      activeClientMessageIdRef.current = null;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.role === "assistant" && m.status === "streaming") {
            return { ...m, status: "error" as const };
          }
          return m;
        })
      );
    };

    const handleDisconnect = (): void => {
      setIsStreaming(false);
      activeClientMessageIdRef.current = null;
      resetConversationForNewSocketSession();
    };

    const handleReconnect = (): void => {
      resetConversationForNewSocketSession();
    };

    const unsubscribeChat =
      subscribeChatHandlers !== undefined
        ? subscribeChatHandlers({
            onSession: handleSession,
            onMessageReceived: handleMessageReceived,
            onChunk: handleChunk,
            onComplete: handleComplete,
            onError: handleChatError,
          })
        : null;

    if (subscribeChatHandlers === undefined) {
      socket.on(CHAT_EVENT_SESSION, handleSession);
      socket.on(CHAT_EVENT_MESSAGE_RECEIVED, handleMessageReceived);
      socket.on(CHAT_EVENT_CHUNK, handleChunk);
      socket.on(CHAT_EVENT_COMPLETE, handleComplete);
      socket.on(CHAT_EVENT_ERROR, handleChatError);
    }

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleReconnect);

    return () => {
      unsubscribeChat?.();
      if (subscribeChatHandlers === undefined) {
        socket.off(CHAT_EVENT_SESSION, handleSession);
        socket.off(CHAT_EVENT_MESSAGE_RECEIVED, handleMessageReceived);
        socket.off(CHAT_EVENT_CHUNK, handleChunk);
        socket.off(CHAT_EVENT_COMPLETE, handleComplete);
        socket.off(CHAT_EVENT_ERROR, handleChatError);
      }
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleReconnect);
    };
  }, [socket, subscribeChatHandlers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || isStreaming) {
        return;
      }
      if (!socket || !socketReady) {
        setError("Sem ligação ao servidor. Aguarde ou atualize a página.");
        return;
      }
      if (trimmed.length > CHAT_MAX_MESSAGE_LENGTH) {
        setError(
          `A mensagem excede o limite de ${CHAT_MAX_MESSAGE_LENGTH} caracteres.`
        );
        return;
      }

      setError(null);

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
        status: "complete",
        authorName: "Você",
      };

      activeClientMessageIdRef.current = userMessage.id;
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      const convId = conversationIdRef.current;
      const payload: ChatSendPayload = {
        conversationId:
          convId !== null && convId.length > 0 ? convId : null,
        text: trimmed,
        clientMessageId: userMessage.id,
      };

      socket.emit(CHAT_EVENT_SEND, payload);
    },
    [isStreaming, socket, socketReady]
  );

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearError,
  };
}
