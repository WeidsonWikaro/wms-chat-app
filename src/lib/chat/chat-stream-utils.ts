import type {
  ChatChunkPayload,
  ChatCompletePayload,
} from "@/lib/socket/chat-protocol";
import type { ChatMessage } from "@/types/chat";

function createdAtFromOptionalSentAt(sentAt: string | undefined): number {
  if (sentAt === undefined) {
    return Date.now();
  }
  const parsed = Date.parse(sentAt);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function extractChunkDelta(payload: ChatChunkPayload): string {
  const c = payload.chunk;
  if (typeof c === "string") {
    return c;
  }
  return "";
}

/**
 * Acrescenta um delta do LLM à mensagem do assistente com `id === assistantMessageId`,
 * ou cria essa mensagem no fim da lista (primeiro chunk).
 * A correlação é feita por `assistantMessageId` (único por resposta); não filtrar por
 * `conversationId` no cliente — diferenças de timing ou UUID impediam qualquer chunk
 * e o `chat:complete` deixava uma bolha vazia.
 */
export function appendAssistantChunk(
  prev: readonly ChatMessage[],
  payload: ChatChunkPayload
): readonly ChatMessage[] {
  const delta = extractChunkDelta(payload);
  const i = prev.findIndex((m) => m.id === payload.assistantMessageId);
  if (i === -1) {
    const assistantMessage: ChatMessage = {
      id: payload.assistantMessageId,
      role: "assistant",
      content: delta,
      createdAt: createdAtFromOptionalSentAt(payload.sentAt),
      sentAtIso: payload.sentAt,
      status: "streaming",
      authorName: "Assistente WMS",
    };
    return [...prev, assistantMessage];
  }
  const copy = [...prev];
  const cur = copy[i];
  if (!cur || cur.role !== "assistant") {
    return prev;
  }
  copy[i] = {
    ...cur,
    content: cur.content + delta,
    status: "streaming",
    sentAtIso: cur.sentAtIso ?? payload.sentAt,
  };
  return copy;
}

/**
 * Marca a resposta do assistente como concluída. Se a mensagem ainda não existir, cria uma vazia (caso raro).
 */
export function markAssistantComplete(
  prev: readonly ChatMessage[],
  payload: ChatCompletePayload
): readonly ChatMessage[] {
  const i = prev.findIndex((m) => m.id === payload.assistantMessageId);
  if (i === -1) {
    const serverOnly: ChatMessage = {
      id: payload.assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: createdAtFromOptionalSentAt(payload.sentAt),
      sentAtIso: payload.sentAt,
      status: "complete",
      authorName: "Assistente WMS",
    };
    return [...prev, serverOnly];
  }
  const copy = [...prev];
  const cur = copy[i];
  if (!cur) {
    return prev;
  }
  copy[i] = {
    ...cur,
    status: "complete",
    sentAtIso: payload.sentAt ?? cur.sentAtIso,
  };
  return copy;
}
