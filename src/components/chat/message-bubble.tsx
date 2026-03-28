import type { ReactElement } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

export interface MessageBubbleProps {
  readonly message: ChatMessage;
  readonly showStreamingCursor: boolean;
}

export function MessageBubble({
  message,
  showStreamingCursor,
}: MessageBubbleProps): ReactElement {
  const isUser = message.role === "user";
  const label = isUser ? "You" : "Assistant";
  const initials = isUser ? "U" : "AI";

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar
        size="sm"
        className="mt-0.5"
        aria-hidden
      >
        <AvatarFallback className={cn(isUser && "bg-primary text-primary-foreground")}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex max-w-[min(100%,42rem)] flex-col gap-1 rounded-xl px-3 py-2 text-sm leading-relaxed ring-1",
          isUser
            ? "items-end bg-primary text-primary-foreground ring-primary/20"
            : "items-start bg-muted/80 text-foreground ring-border/80"
        )}
      >
        <span className="sr-only">{label}</span>
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {showStreamingCursor ? (
            <span
              className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-sm bg-current align-middle"
              aria-hidden
            />
          ) : null}
        </p>
      </div>
    </div>
  );
}
