import { fetchChatDevToken } from "@/lib/api/chat-dev-token";
import { useAuthStore } from "@/lib/auth/auth-store";

/**
 * Após o health do servidor:
 * - Se existir `NEXT_PUBLIC_WS_AUTH_TOKEN`, usa-o (override manual).
 * - Caso contrário, chama sempre `POST /api/chat/dev-token` e persiste com `bootstrapAccessToken`.
 */
export async function resolveChatAuthToken(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_WS_AUTH_TOKEN?.trim() ?? "";
  if (fromEnv.length > 0) {
    useAuthStore.getState().bootstrapAccessToken(fromEnv);
    return fromEnv;
  }
  const sub = process.env.NEXT_PUBLIC_CHAT_DEV_SUB?.trim();
  const token = await fetchChatDevToken(sub ? { sub } : undefined);
  useAuthStore.getState().bootstrapAccessToken(token);
  return token;
}
