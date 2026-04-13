import type { ReactElement } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/** Três pontos com animação de salto (reutilizável na bolha do assistente “pensando”). */
export function AssistantThinkingDots(): ReactElement {
  return (
    <span
      className="inline-flex items-center gap-1.5 py-0.5 align-middle"
      aria-hidden
    >
      <span className="chat-dot" />
      <span className="chat-dot animation-delay-200" />
      <span className="chat-dot animation-delay-400" />
    </span>
  );
}

export type ChatTypingIndicatorVariant = "connecting" | "responding";

export interface ChatTypingIndicatorProps {
  /** `connecting` — health/gateway; `responding` — à espera do primeiro `chat:chunk`. */
  readonly variant?: ChatTypingIndicatorVariant;
}

/**
 * Balão estilo assistente com reticências animadas (estado de carregamento / digitação).
 */
export function ChatTypingIndicator({
  variant = "connecting",
}: ChatTypingIndicatorProps): ReactElement {
  const ariaLabel =
    variant === "responding"
      ? "O assistente está respondendo"
      : "Conectando ao servidor";
  return (
    <div
      className="flex w-full gap-2 flex-row"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <Avatar size="sm" className="mt-auto shrink-0" aria-hidden>
        <AvatarFallback className="bg-teal-700 text-[0.65rem] font-semibold text-white">
          AW
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 max-w-[min(100%,28rem)] flex-col gap-0.5 items-start">
        <span className="px-1 text-xs font-semibold text-teal-900/80">
          Assistente WMS
        </span>
        <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-zinc-700 ring-1 ring-black/5 shadow-sm">
          <AssistantThinkingDots />
        </div>
      </div>
    </div>
  );
}
