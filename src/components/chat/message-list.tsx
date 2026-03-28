"use client";

import type { ReactElement } from "react";
import { useEffect, useRef } from "react";

import type { ChatMessage } from "@/types/chat";

import { MessageBubble } from "@/components/chat/message-bubble";

export interface MessageListProps {
  readonly messages: readonly ChatMessage[];
  readonly isStreaming: boolean;
}

export function MessageList({
  messages,
  isStreaming,
}: MessageListProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="chat-pattern flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.length === 0 ? (
        <div
          className="flex min-h-full flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm text-zinc-600"
          role="status"
        >
          <p className="font-medium text-zinc-800">Nenhuma mensagem ainda</p>
          <p>Escreva abaixo para começar a conversa.</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const showCursor =
            message.role === "assistant" &&
            message.status === "streaming" &&
            isStreaming &&
            isLast;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              showStreamingCursor={showCursor}
            />
          );
        })
      )}
    </div>
  );
}
