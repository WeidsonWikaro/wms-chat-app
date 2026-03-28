/**
 * Transport contract for chat backends. Implement with SSE, WebSocket, or fetch streams.
 * UI and hooks depend on this abstraction (dependency inversion).
 */
export interface StreamAssistantParams {
  readonly userText: string;
}

export interface IChatTransport {
  streamAssistantReply(params: StreamAssistantParams): AsyncIterable<string>;
}
