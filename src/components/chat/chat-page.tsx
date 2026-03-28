"use client";

import type { ReactElement } from "react";
import { useCallback } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        <Card className="flex min-h-[min(100%,36rem)] flex-1 flex-col overflow-hidden shadow-sm">
          <ChatHeader />
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-0">
            <MessageList messages={messages} isStreaming={isStreaming} />
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <p className="font-medium">Could not complete the reply.</p>
                <p className="text-destructive/90">{error}</p>
                <button
                  type="button"
                  onClick={clearError}
                  className="mt-2 text-xs font-medium underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-border/60">
            <ChatComposer disabled={isStreaming} onSend={handleSend} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
