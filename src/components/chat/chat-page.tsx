"use client";

import type { ReactElement } from "react";
import { useCallback } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { useChat } from "@/hooks/use-chat";

export function ChatPage(): ReactElement {
  const { messages, isStreaming, error, sendMessage, clearError } = useChat();

  const handleSend = useCallback(
    async (text: string) => {
      await sendMessage(text);
    },
    [sendMessage]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-950">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col overflow-hidden shadow-2xl shadow-black/40">
        <ChatHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#efeae2]">
          <MessageList messages={messages} isStreaming={isStreaming} />
          {error ? (
            <div
              role="alert"
              className="shrink-0 border-t border-red-200/80 bg-red-50/95 px-3 py-2 text-sm text-red-900 sm:px-4"
            >
              <p className="font-medium">Não foi possível concluir a resposta.</p>
              <p className="text-red-800">{error}</p>
              <button
                type="button"
                onClick={clearError}
                className="mt-2 text-xs font-medium text-red-900 underline underline-offset-2"
              >
                Fechar
              </button>
            </div>
          ) : null}
        </div>
        <footer className="shrink-0 border-t border-zinc-200 bg-[#f0f2f5] px-3 py-3 sm:px-4">
          <ChatComposer disabled={isStreaming} onSend={handleSend} />
        </footer>
      </div>
    </div>
  );
}
