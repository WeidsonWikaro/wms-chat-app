import { create } from "zustand";

import {
  loadAuthFromSession,
  saveAuthToSession,
  type PersistedAuth,
} from "@/lib/auth/auth-storage";

export interface AuthState {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  /** Incrementado em login/logout para o Socket.IO voltar a ligar com o JWT atual. */
  readonly reconnectNonce: number;
  /** Grava token sem forçar reconexão (bootstrap pós /health + dev-token). */
  readonly bootstrapAccessToken: (accessToken: string) => void;
  readonly setSession: (tokens: PersistedAuth) => void;
  readonly clearSession: () => void;
  readonly hydrateFromSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  reconnectNonce: 0,
  hydrateFromSession: () => {
    const p = loadAuthFromSession();
    if (p) {
      set({
        accessToken: p.accessToken,
        refreshToken: p.refreshToken ?? null,
      });
    }
  },
  bootstrapAccessToken: (accessToken) => {
    saveAuthToSession({ accessToken });
    set({
      accessToken,
      refreshToken: null,
    });
  },
  setSession: (tokens) => {
    saveAuthToSession(tokens);
    set((s) => ({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? null,
      reconnectNonce: s.reconnectNonce + 1,
    }));
  },
  clearSession: () => {
    saveAuthToSession(null);
    set((s) => ({
      accessToken: null,
      refreshToken: null,
      reconnectNonce: s.reconnectNonce + 1,
    }));
  },
}));
