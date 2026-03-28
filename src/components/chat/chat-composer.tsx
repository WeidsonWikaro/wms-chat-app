"use client";

import type { KeyboardEvent, ReactElement } from "react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ChatComposerProps {
  readonly disabled: boolean;
  readonly onSend: (text: string) => Promise<void>;
}

export function ChatComposer({
  disabled,
  onSend,
}: ChatComposerProps): ReactElement {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(async () => {
    const text = value.trim();
    if (text.length === 0 || disabled) {
      return;
    }
    setValue("");
    await onSend(text);
  }, [disabled, onSend, value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="sr-only" htmlFor="chat-message-input">
        Message
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Textarea
          id="chat-message-input"
          name="message"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message… (Enter to send, Shift+Enter for newline)"
          disabled={disabled}
          rows={2}
          className="min-h-[4.5rem] flex-1 resize-none"
          aria-label="Chat message input"
        />
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={disabled || value.trim().length === 0}
          className="shrink-0 sm:h-[4.5rem] sm:min-w-[6rem]"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
