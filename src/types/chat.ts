export type ChatRole = "user" | "assistant" | "system";

export type MessageStatus = "streaming" | "complete" | "error";

export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: number;
  /** ISO 8601 (servidor ou cliente ao enviar); usado para hora no balão. */
  readonly sentAtIso?: string;
  readonly status?: MessageStatus;
  /** Nome exibido acima da bolha (ex.: contato ou “Você”). */
  readonly authorName?: string;
}
