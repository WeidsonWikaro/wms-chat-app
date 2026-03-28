"use client";

import type { KeyboardEvent, ReactElement } from "react";
import { useCallback, useState } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ChatComposerProps {
  /** Sem ligação / token: desativa o campo e o envio. */
  readonly disabled: boolean;
  /**
   * Resposta em curso: não envia outra mensagem, mas o campo continua ativo
   * para não perder o foco (evita `disabled` no textarea durante o stream).
   */
  readonly blockOutgoing?: boolean;
  readonly onSend: (text: string) => Promise<void>;
}

export function ChatComposer({
  disabled,
  blockOutgoing = false,
  onSend,
}: ChatComposerProps): ReactElement {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(async () => {
    const text = value.trim();
    if (text.length === 0 || disabled || blockOutgoing) {
      return;
    }
    setValue("");
    await onSend(text);
  }, [blockOutgoing, disabled, onSend, value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (disabled || blockOutgoing) {
          return;
        }
        void handleSubmit();
      }
    },
    [blockOutgoing, disabled, handleSubmit]
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="sr-only" htmlFor="chat-message-input">
        Mensagem
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Textarea
          id="chat-message-input"
          name="message"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mensagem"
          disabled={disabled}
          rows={2}
          className="min-h-[3.25rem] flex-1 resize-none border-zinc-200 bg-white focus-visible:ring-emerald-600/30"
          aria-label="Campo de mensagem do chat"
        />
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={disabled || blockOutgoing || value.trim().length === 0}
          className="h-11 shrink-0 gap-2 bg-emerald-700 px-5 text-white hover:bg-emerald-800 sm:h-[3.25rem] sm:min-w-[5.5rem]"
          aria-label="Enviar mensagem"
        >
          <Send className="size-4" aria-hidden />
          Enviar
        </Button>
      </div>
    </div>
  );
}
