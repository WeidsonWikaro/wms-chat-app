import { apiClient } from "@/lib/api/axios-instance";
import type { LoginRequest } from "@/types/auth";

function getLoginPath(): string {
  return process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH ?? "/auth/login";
}

function getRefreshPath(): string {
  return process.env.NEXT_PUBLIC_AUTH_REFRESH_PATH ?? "/auth/refresh";
}

function getLogoutPath(): string {
  return process.env.NEXT_PUBLIC_AUTH_LOGOUT_PATH ?? "/auth/logout";
}

export interface NormalizedTokens {
  readonly accessToken: string;
  readonly refreshToken?: string;
}

function normalizeTokenResponse(data: unknown): NormalizedTokens | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const o = data as Record<string, unknown>;
  const access =
    (typeof o.access_token === "string" && o.access_token) ||
    (typeof o.accessToken === "string" && o.accessToken) ||
    (typeof o.token === "string" && o.token);
  if (!access) {
    return null;
  }
  const refresh =
    (typeof o.refresh_token === "string" && o.refresh_token) ||
    (typeof o.refreshToken === "string" && o.refreshToken);
  return {
    accessToken: access,
    refreshToken: refresh || undefined,
  };
}

export async function loginRequest(
  body: LoginRequest
): Promise<NormalizedTokens> {
  const { data } = await apiClient.post<unknown>(getLoginPath(), body);
  const tokens = normalizeTokenResponse(data);
  if (!tokens) {
    throw new Error("Resposta de login inválida (access token em falta).");
  }
  return tokens;
}

export async function refreshAccessTokenRequest(
  refreshToken: string
): Promise<NormalizedTokens> {
  const { data } = await apiClient.post<unknown>(getRefreshPath(), {
    refreshToken,
  });
  const tokens = normalizeTokenResponse(data);
  if (!tokens) {
    throw new Error("Resposta de refresh inválida.");
  }
  return tokens;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await apiClient.post(getLogoutPath(), { refreshToken });
}
