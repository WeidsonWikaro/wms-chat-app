import type { ReactElement } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * Balão estilo assistente com reticências animadas (estado de carregamento / digitação).
 */
export function ChatTypingIndicator(): ReactElement {
  return (
    <div
      className="flex w-full gap-2 flex-row"
      role="status"
      aria-live="polite"
      aria-label="Conectando ao servidor"
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
          <span className="inline-flex items-center gap-1 font-medium tracking-tight">
            <span className="chat-dot" />
            <span className="chat-dot animation-delay-200" />
            <span className="chat-dot animation-delay-400" />
          </span>
        </div>
      </div>
    </div>
  );
}
