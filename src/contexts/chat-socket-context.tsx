"use client";

import { io, type Socket } from "socket.io-client";
import type { ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { redirectToLoginIfNeeded } from "@/lib/auth/auth-navigation";
import { recoverSessionWithRefresh } from "@/lib/auth/recover-session-with-refresh";
import { useAuthStore } from "@/lib/auth/auth-store";
import {
  CHAT_EVENT_CHUNK,
  CHAT_EVENT_COMPLETE,
  CHAT_EVENT_ERROR,
  CHAT_EVENT_MESSAGE_RECEIVED,
  CHAT_EVENT_SESSION,
  CHAT_NAMESPACE,
  CHAT_SOCKET_PATH,
  type ChatChunkPayload,
  type ChatCompletePayload,
  type ChatErrorPayload,
  type ChatMessageReceivedPayload,
  type ChatSessionPayload,
  type ChatSocketHandlers,
} from "@/lib/socket/chat-protocol";
import { resolveChatAuthToken } from "@/lib/socket/resolve-chat-auth-token";
import { getSocketIoTransports } from "@/lib/socket/socket-io-options";
import { getWsBaseUrl } from "@/lib/socket/ws-config";

export type ChatSocketConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface ChatSocketContextValue {
  readonly socket: Socket | null;
  readonly status: ChatSocketConnectionStatus;
  readonly error: string | null;
  readonly isReady: boolean;
  /** Enquanto resolve JWT (env ou POST dev-token). */
  readonly isTokenLoading: boolean;
  /** Falha ao obter token (ex.: dev-token indisponível). */
  readonly tokenError: string | null;
  /**
   * Liga handlers a eventos `chat:*` logo após `io()` (com buffer até o primeiro subscribe),
   * para não perder saudações emitidas no mesmo tick que o connect.
   */
  readonly subscribeChatHandlers: (handlers: ChatSocketHandlers) => () => void;
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

export interface ChatSocketProviderProps {
  readonly enabled: boolean;
  readonly children: ReactNode;
}

export function ChatSocketProvider({
  enabled,
  children,
}: ChatSocketProviderProps): ReactElement {
  const reconnectNonce = useAuthStore((s) => s.reconnectNonce);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ChatSocketConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const chatHandlersRef = useRef<ChatSocketHandlers | null>(null);
  const pendingSessionRef = useRef<ChatSessionPayload[]>([]);
  const pendingMessageReceivedRef = useRef<ChatMessageReceivedPayload[]>([]);
  const pendingChunkRef = useRef<ChatChunkPayload[]>([]);
  const pendingCompleteRef = useRef<ChatCompletePayload[]>([]);
  const pendingErrorRef = useRef<ChatErrorPayload[]>([]);

  const connectionGenerationRef = useRef(0);
  const socketAuthRecoveryInFlightRef = useRef(false);

  const subscribeChatHandlers = useCallback(
    (handlers: ChatSocketHandlers): (() => void) => {
      chatHandlersRef.current = handlers;
      const flushPending = (): void => {
        for (const p of pendingSessionRef.current) {
          handlers.onSession(p);
        }
        pendingSessionRef.current = [];
        for (const p of pendingMessageReceivedRef.current) {
          handlers.onMessageReceived(p);
        }
        pendingMessageReceivedRef.current = [];
        for (const p of pendingChunkRef.current) {
          handlers.onChunk(p);
        }
        pendingChunkRef.current = [];
        for (const p of pendingCompleteRef.current) {
          handlers.onComplete(p);
        }
        pendingCompleteRef.current = [];
        for (const p of pendingErrorRef.current) {
          handlers.onError(p);
        }
        pendingErrorRef.current = [];
      };
      flushPending();
      return () => {
        if (chatHandlersRef.current === handlers) {
          chatHandlersRef.current = null;
        }
      };
    },
    []
  );

  const disconnectSocket = useCallback((): void => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnectSocket();
      chatHandlersRef.current = null;
      pendingSessionRef.current = [];
      pendingMessageReceivedRef.current = [];
      pendingChunkRef.current = [];
      pendingCompleteRef.current = [];
      pendingErrorRef.current = [];
      setStatus("idle");
      setError(null);
      setIsTokenLoading(false);
      setTokenError(null);
      return;
    }

    const generation = ++connectionGenerationRef.current;
    const isCurrentGeneration = (): boolean =>
      connectionGenerationRef.current === generation;

    let cancelled = false;
    pendingSessionRef.current = [];
    pendingMessageReceivedRef.current = [];
    pendingChunkRef.current = [];
    pendingCompleteRef.current = [];
    pendingErrorRef.current = [];

    setIsTokenLoading(true);
    setTokenError(null);
    setError(null);
    setStatus("connecting");

    void (async () => {
      try {
        const token = await resolveChatAuthToken();
        if (cancelled) {
          return;
        }
        setIsTokenLoading(false);

        if (token.trim().length === 0) {
          setTokenError(
            "Não foi possível obter o token (inicie sessão, ou configure NEXT_PUBLIC_WS_AUTH_TOKEN / dev-token)."
          );
          setStatus("error");
          return;
        }

        const url = `${getWsBaseUrl()}${CHAT_NAMESPACE}`;
        const s = io(url, {
          path: CHAT_SOCKET_PATH,
          transports: getSocketIoTransports(),
          auth: {
            token,
          },
        });

        socketRef.current = s;

        if (cancelled) {
          s.disconnect();
          socketRef.current = null;
          return;
        }

        let wasAuthenticatedConnect = false;

        const runAuthRecoveryAfterSocketFailure = async (): Promise<void> => {
          if (socketAuthRecoveryInFlightRef.current) {
            return;
          }
          socketAuthRecoveryInFlightRef.current = true;
          try {
            if (!isCurrentGeneration()) {
              return;
            }
            const hasRefresh = Boolean(
              useAuthStore.getState().refreshToken?.trim().length
            );
            s.disconnect();
            if (!isCurrentGeneration()) {
              return;
            }
            if (!hasRefresh) {
              useAuthStore.getState().clearSession();
              redirectToLoginIfNeeded();
              setTokenError(
                "Sessão expirada ou token inválido. Inicie sessão novamente."
              );
              setStatus("error");
              return;
            }
            if (!isCurrentGeneration()) {
              return;
            }
            const result = await recoverSessionWithRefresh();
            if (!isCurrentGeneration()) {
              return;
            }
            switch (result) {
              case "refreshed":
                setError(null);
                setTokenError(null);
                break;
              case "network_error":
                setError(
                  "Sem ligação ao servidor. Verifique a rede e tente novamente."
                );
                setStatus("error");
                break;
              case "refresh_failed":
              case "no_refresh_token":
                useAuthStore.getState().clearSession();
                redirectToLoginIfNeeded();
                break;
              default:
                break;
            }
          } finally {
            socketAuthRecoveryInFlightRef.current = false;
          }
        };

        const forwardOrQueueSession = (p: ChatSessionPayload): void => {
          const h = chatHandlersRef.current;
          if (h) {
            h.onSession(p);
          } else {
            pendingSessionRef.current.push(p);
          }
        };
        const forwardOrQueueMessageReceived = (
          p: ChatMessageReceivedPayload
        ): void => {
          const h = chatHandlersRef.current;
          if (h) {
            h.onMessageReceived(p);
          } else {
            pendingMessageReceivedRef.current.push(p);
          }
        };
        const forwardOrQueueChunk = (p: ChatChunkPayload): void => {
          const h = chatHandlersRef.current;
          if (h) {
            h.onChunk(p);
          } else {
            pendingChunkRef.current.push(p);
          }
        };
        const forwardOrQueueComplete = (p: ChatCompletePayload): void => {
          const h = chatHandlersRef.current;
          if (h) {
            h.onComplete(p);
          } else {
            pendingCompleteRef.current.push(p);
          }
        };
        const forwardOrQueueError = (p: ChatErrorPayload): void => {
          const h = chatHandlersRef.current;
          if (h) {
            h.onError(p);
          } else {
            pendingErrorRef.current.push(p);
          }
        };

        s.on(CHAT_EVENT_SESSION, forwardOrQueueSession);
        s.on(CHAT_EVENT_MESSAGE_RECEIVED, forwardOrQueueMessageReceived);
        s.on(CHAT_EVENT_CHUNK, forwardOrQueueChunk);
        s.on(CHAT_EVENT_COMPLETE, forwardOrQueueComplete);
        s.on(CHAT_EVENT_ERROR, forwardOrQueueError);

        setSocket(s);

        const handleConnect = (): void => {
          wasAuthenticatedConnect = true;
          setStatus("connected");
          setError(null);
        };

        const handleConnectError = (err: Error): void => {
          setStatus("error");
          setError(err.message);
          void runAuthRecoveryAfterSocketFailure();
        };

        const isAuthRelatedDisconnectReason = (reason: string): boolean => {
          if (reason === "io server disconnect") {
            return true;
          }
          const r = reason.toLowerCase();
          return (
            r.includes("jwt") ||
            r.includes("unauthor") ||
            r.includes("forbidden") ||
            r.includes("expired")
          );
        };

        const handleDisconnect = (reason: string): void => {
          setStatus("disconnected");
          if (
            wasAuthenticatedConnect &&
            isAuthRelatedDisconnectReason(reason)
          ) {
            void runAuthRecoveryAfterSocketFailure();
          }
          wasAuthenticatedConnect = false;
        };

        s.on("connect", handleConnect);
        s.on("connect_error", handleConnectError);
        s.on("disconnect", handleDisconnect);

        if (s.connected) {
          handleConnect();
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        setIsTokenLoading(false);
        const msg =
          err instanceof Error ? err.message : "Falha ao obter token de acesso.";
        setTokenError(msg);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      disconnectSocket();
      chatHandlersRef.current = null;
      pendingSessionRef.current = [];
      pendingMessageReceivedRef.current = [];
      pendingChunkRef.current = [];
      pendingCompleteRef.current = [];
      pendingErrorRef.current = [];
      setStatus("idle");
      setError(null);
      setIsTokenLoading(false);
      setTokenError(null);
    };
  }, [enabled, disconnectSocket, reconnectNonce]);

  const value = useMemo<ChatSocketContextValue>(
    () => ({
      socket,
      status,
      error,
      isReady: status === "connected",
      isTokenLoading,
      tokenError,
      subscribeChatHandlers,
    }),
    [socket, status, error, isTokenLoading, tokenError, subscribeChatHandlers]
  );

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocket(): ChatSocketContextValue {
  const ctx = useContext(ChatSocketContext);
  if (!ctx) {
    throw new Error("useChatSocket must be used within ChatSocketProvider");
  }
  return ctx;
}
