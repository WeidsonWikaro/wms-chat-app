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

  if (messages.length === 0) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground"
        role="status"
      >
        <p className="font-medium text-foreground">Start a conversation</p>
        <p>Type a message below. Responses stream in using the mock transport.</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded-lg border border-border/50 bg-background/60 p-4"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((message, index) => {
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
      })}
    </div>
  );
}
