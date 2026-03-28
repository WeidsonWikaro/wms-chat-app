import { apiClient } from "@/lib/api/axios-instance";

export interface ChatDevTokenRequestBody {
  readonly sub?: string;
}

/**
 * POST /api/chat/dev-token — apenas quando o Nest expõe o endpoint (CHAT_DEV_TOKEN_ENDPOINT).
 */
export async function fetchChatDevToken(
  body?: ChatDevTokenRequestBody
): Promise<string> {
  const { data } = await apiClient.post<unknown>(
    "/chat/dev-token",
    body?.sub ? { sub: body.sub } : {}
  );
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.token === "string" && o.token.length > 0) {
      return o.token;
    }
    if (typeof o.access_token === "string" && o.access_token.length > 0) {
      return o.access_token;
    }
    if (typeof o.accessToken === "string" && o.accessToken.length > 0) {
      return o.accessToken;
    }
  }
  throw new Error("Resposta de dev-token inválida (esperado token ou access_token).");
}
