import type { ReactElement } from "react";

import { AssistantThinkingDots } from "@/components/chat/chat-typing-indicator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatMessageTimeLabel } from "@/lib/chat/format-message-time";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    if (a && b) {
      return `${a}${b}`.toUpperCase();
    }
  }
  return displayName.slice(0, 2).toUpperCase();
}

export interface MessageBubbleProps {
  readonly message: ChatMessage;
  readonly showStreamingCursor: boolean;
}

export function MessageBubble({
  message,
  showStreamingCursor,
}: MessageBubbleProps): ReactElement {
  const isUser = message.role === "user";
  const displayName =
    message.authorName ?? (isUser ? "Você" : "Assistente WMS");
  const initials = getInitials(displayName);

  const shouldShowTime =
    (isUser && message.sentAtIso !== undefined) ||
    (!isUser &&
      (message.sentAtIso !== undefined ||
        (message.role === "assistant" && message.content.length > 0)));
  const timeLabel = shouldShowTime
    ? formatMessageTimeLabel(message.sentAtIso, message.createdAt)
    : "";
  const timeIso =
    message.sentAtIso !== undefined
      ? message.sentAtIso
      : new Date(message.createdAt).toISOString();

  const isAssistantThinking =
    !isUser &&
    message.status === "streaming" &&
    message.content.length === 0;
  const showEndCursor =
    showStreamingCursor && message.content.length > 0;

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar
        size="sm"
        className="mt-auto shrink-0"
        aria-hidden
      >
        <AvatarFallback
          className={cn(
            "text-[0.65rem] font-semibold",
            isUser
              ? "bg-emerald-600 text-white"
              : "bg-teal-700 text-white"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex min-w-0 max-w-[min(100%,28rem)] flex-col gap-0.5",
          isUser ? "items-end" : "items-start"
        )}
      >
        {!isUser ? (
          <span className="px-1 text-xs font-semibold text-teal-900/80">
            {displayName}
          </span>
        ) : null}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
            isUser
              ? "rounded-br-sm bg-emerald-200 text-emerald-950"
              : "rounded-bl-sm bg-white text-zinc-900 ring-1 ring-black/5"
          )}
        >
          <span className="sr-only">{displayName}</span>
          {isAssistantThinking ? (
            <p className="min-h-[1.25rem]">
              <span className="sr-only">Assistente está respondendo</span>
              <AssistantThinkingDots />
            </p>
          ) : (
            <p className="whitespace-pre-wrap break-words">
              {message.content}
              {showEndCursor ? (
                <span
                  className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-sm bg-current align-middle"
                  aria-hidden
                />
              ) : null}
            </p>
          )}
        </div>
        {timeLabel.length > 0 ? (
          <time
            className={cn(
              "px-1 text-[0.65rem] tabular-nums text-zinc-500",
              isUser ? "text-right" : "text-left"
            )}
            dateTime={timeIso}
          >
            {timeLabel}
          </time>
        ) : null}
      </div>
    </div>
  );
}
