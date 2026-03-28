const AUTH_STORAGE_KEY = "chat-app.auth.v1";

export interface PersistedAuth {
  readonly accessToken: string;
  readonly refreshToken?: string;
}

export function loadAuthFromSession(): PersistedAuth | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    const o = parsed as Record<string, unknown>;
    if (typeof o.accessToken !== "string" || o.accessToken.length === 0) {
      return null;
    }
    return {
      accessToken: o.accessToken,
      refreshToken:
        typeof o.refreshToken === "string" ? o.refreshToken : undefined,
    };
  } catch {
    return null;
  }
}

export function saveAuthToSession(auth: PersistedAuth | null): void {
  if (typeof window === "undefined") {
    return;
  }
  if (!auth) {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}
