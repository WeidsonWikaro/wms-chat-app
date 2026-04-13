/** Versão do contrato chat (alinhada com o backend Nest). */
export const CHAT_PROTOCOL_VERSION = 1 as const;

export const CHAT_MAX_MESSAGE_LENGTH = 16_000;

export const CHAT_SOCKET_PATH = "/socket.io";

export const CHAT_NAMESPACE = "/chat";

/** Cliente → servidor */
export const CHAT_EVENT_SEND = "chat:send";

/** Servidor → cliente */
export const CHAT_EVENT_SESSION = "chat:session";
export const CHAT_EVENT_MESSAGE_RECEIVED = "chat:message_received";
export const CHAT_EVENT_CHUNK = "chat:chunk";
export const CHAT_EVENT_COMPLETE = "chat:complete";
export const CHAT_EVENT_ERROR = "chat:error";

/** `null` = novo diálogo; string = continuação (validação Nest: null ou string, não undefined). */
export interface ChatSendPayload {
  readonly conversationId: string | null;
  readonly text: string;
  readonly clientMessageId: string;
}

export interface ChatSessionPayload {
  readonly conversationId: string;
  /** Instante da criação da conversa (ISO 8601). */
  readonly sentAt?: string;
  /** Texto de boas-vindas enviado pelo servidor (se existir no DTO). */
  readonly welcomeMessage?: string;
  /** Alternativa comum a `welcomeMessage` em alguns backends. */
  readonly message?: string;
}

/** Confirmação da mensagem do utilizador após validação (antes dos chunks do assistente). */
export interface ChatMessageReceivedPayload {
  readonly clientMessageId: string;
  readonly conversationId: string;
  readonly sentAt: string;
}

export interface ChatChunkPayload {
  readonly assistantMessageId: string;
  readonly conversationId: string;
  /**
   * Delta do modelo (pode ser sub-palavra). Concatenar em ordem até `chat:complete`
   * para este `assistantMessageId`.
   */
  readonly chunk: string;
  /** Mesmo valor para todos os chunks da mesma resposta do assistente. */
  readonly sentAt?: string;
}

export interface ChatCompletePayload {
  readonly assistantMessageId: string;
  readonly conversationId: string;
  /** Alinhado ao `sentAt` dos chunks desta mensagem. */
  readonly sentAt?: string;
}

export interface ChatErrorPayload {
  readonly code: string;
  readonly message: string;
  readonly sentAt?: string;
  readonly clientMessageId?: string;
}

/** Handlers de negócio (registados no servidor ao criar o socket, não só após `connect`). */
export interface ChatSocketHandlers {
  readonly onSession: (payload: ChatSessionPayload) => void;
  readonly onMessageReceived: (payload: ChatMessageReceivedPayload) => void;
  readonly onChunk: (payload: ChatChunkPayload) => void;
  readonly onComplete: (payload: ChatCompletePayload) => void;
  readonly onError: (payload: ChatErrorPayload) => void;
}

export function pendingAssistantMessageId(
  clientMessageId: string
): string {
  return `pending-${clientMessageId}`;
}
