export type ChatRole = "user" | "assistant" | "system";

export type MessageStatus = "streaming" | "complete" | "error";

export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: number;
  readonly status?: MessageStatus;
}
