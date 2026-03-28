import type { IChatTransport, StreamAssistantParams } from "@/lib/chat/chat-transport";

const STREAM_WORD_DELAY_MS = 28;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Placeholder transport that simulates token/word streaming. Swap for a real backend client.
 */
export class MockChatTransport implements IChatTransport {
  async *streamAssistantReply(
    params: StreamAssistantParams
  ): AsyncIterable<string> {
    const reply = `You said: "${params.userText}". This is a mock streamed reply — replace MockChatTransport with your streaming API client (SSE, WebSocket, or ReadableStream).`;
    const parts = reply.split(/(\s+)/);
    for (const part of parts) {
      await delay(STREAM_WORD_DELAY_MS + Math.floor(Math.random() * 24));
      yield part;
    }
  }
}
