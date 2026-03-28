"use client";

import type { ReactElement } from "react";
import { useCallback, useMemo } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { HealthErrorDialog } from "@/components/chat/health-error-dialog";
import { MessageList } from "@/components/chat/message-list";
import {
  ChatSocketProvider,
  useChatSocket,
} from "@/contexts/chat-socket-context";
import { useChat } from "@/hooks/use-chat";
import { useHealthQuery } from "@/hooks/use-health-query";

interface ChatPageInnerProps {
  readonly healthSuccess: boolean;
  readonly healthPending: boolean;
  readonly healthError: boolean;
  readonly healthFetching: boolean;
  readonly onHealthRetry: () => void;
}

function ChatPageInner({
  healthSuccess,
  healthPending,
  healthError,
  healthFetching,
  onHealthRetry,
}: ChatPageInnerProps): ReactElement {
  const {
    socket,
    isReady,
    status,
    error: socketError,
    isTokenLoading,
    tokenError,
    subscribeChatHandlers,
  } = useChatSocket();
  const { messages, isStreaming, error, sendMessage, clearError } = useChat({
    socket,
    socketReady: isReady,
    subscribeChatHandlers,
  });

  /** Reticências até health OK → token → socket /chat → primeira mensagem do servidor. */
  const showConnectionLoading = useMemo(() => {
    if (healthPending) {
      return true;
    }
    if (!healthSuccess) {
      return false;
    }
    if (tokenError !== null) {
      return false;
    }
    if (isTokenLoading || !isReady) {
      return true;
    }
    if (messages.length === 0) {
      return true;
    }
    return false;
  }, [
    healthPending,
    healthSuccess,
    isTokenLoading,
    isReady,
    messages.length,
    tokenError,
  ]);

  const handleSend = useCallback(
    async (text: string) => {
      await sendMessage(text);
    },
    [sendMessage]
  );

  const canUseChat =
    healthSuccess && isReady && !isTokenLoading && tokenError === null;
  const composerDisabled = !canUseChat;

  const showTokenErrorBanner = healthSuccess && tokenError !== null;
  const showSocketTransportError =
    healthSuccess &&
    tokenError === null &&
    status === "error" &&
    socketError !== null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-950">
      <HealthErrorDialog
        open={healthError}
        isRetrying={healthFetching && healthError}
        onRetry={onHealthRetry}
      />
      <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col overflow-hidden shadow-2xl shadow-black/40">
        <ChatHeader />
        {showTokenErrorBanner ? (
          <div
            className="shrink-0 border-b border-red-200/80 bg-red-50 px-4 py-2 text-center text-xs text-red-950"
            role="alert"
          >
            Token: {tokenError}
          </div>
        ) : null}
        {showSocketTransportError ? (
          <div
            className="shrink-0 border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-center text-xs text-amber-950"
            role="alert"
          >
            Ligação em tempo real: {socketError}
          </div>
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#efeae2]">
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            showConnectionLoading={showConnectionLoading}
          />
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
          <ChatComposer
            disabled={composerDisabled}
            blockOutgoing={isStreaming}
            onSend={handleSend}
          />
        </footer>
      </div>
    </div>
  );
}

export function ChatPage(): ReactElement {
  const healthQuery = useHealthQuery();
  const healthSuccess = healthQuery.isSuccess;
  const healthPending = healthQuery.isPending;
  const healthError = healthQuery.isError;
  const healthFetching = healthQuery.isFetching;

  const handleHealthRetry = useCallback(() => {
    void healthQuery.refetch();
  }, [healthQuery]);

  return (
    <ChatSocketProvider enabled={healthSuccess}>
      <ChatPageInner
        healthSuccess={healthSuccess}
        healthPending={healthPending}
        healthError={healthError}
        healthFetching={healthFetching}
        onHealthRetry={handleHealthRetry}
      />
    </ChatSocketProvider>
  );
}
