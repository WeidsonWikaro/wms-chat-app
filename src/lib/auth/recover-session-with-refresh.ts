import { isAxiosError } from "axios";

import { refreshAccessTokenRequest } from "@/lib/auth/auth-api";
import { useAuthStore } from "@/lib/auth/auth-store";

export type RecoverSessionWithRefreshResult =
  | "refreshed"
  | "no_refresh_token"
  | "refresh_failed"
  | "network_error";

function isLikelyNetworkFailure(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return true;
  }
  return error.response === undefined;
}

/**
 * Renova access + refresh (rotação) via `POST /auth/refresh`.
 * Em sucesso chama `setSession` (inclui `reconnectNonce` para o Socket.IO).
 */
export async function recoverSessionWithRefresh(): Promise<RecoverSessionWithRefreshResult> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken || refreshToken.length === 0) {
    return "no_refresh_token";
  }
  try {
    const tokens = await refreshAccessTokenRequest(refreshToken);
    useAuthStore.getState().setSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? refreshToken,
    });
    return "refreshed";
  } catch (e) {
    if (isLikelyNetworkFailure(e)) {
      return "network_error";
    }
    return "refresh_failed";
  }
}
