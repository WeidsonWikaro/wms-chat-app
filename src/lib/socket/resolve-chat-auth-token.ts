import { fetchChatDevToken } from "@/lib/api/chat-dev-token";
import { getAuthAccessTokenSync } from "@/lib/auth/auth-access";
import { useAuthStore } from "@/lib/auth/auth-store";

/**
 * Token JWT para o namespace Socket.IO `/chat`:
 * 1. Sessão de login (access token em memória/sessionStorage).
 * 2. Override explícito `NEXT_PUBLIC_WS_AUTH_TOKEN` (dev).
 * 3. `POST /api/chat/dev-token` como último recurso.
 */
export async function resolveChatAuthToken(): Promise<string> {
  const fromSession = getAuthAccessTokenSync().trim();
  if (fromSession.length > 0) {
    return fromSession;
  }
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
