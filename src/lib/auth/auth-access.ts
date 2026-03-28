import { loadAuthFromSession } from "@/lib/auth/auth-storage";
import { useAuthStore } from "@/lib/auth/auth-store";

/**
 * Token atual para REST e Socket.IO (síncrono no cliente).
 * Prioridade: sessionStorage (persistido) → estado Zustand.
 */
export function getAuthAccessTokenSync(): string {
  if (typeof window !== "undefined") {
    const fromStorage = loadAuthFromSession()?.accessToken?.trim();
    if (fromStorage && fromStorage.length > 0) {
      return fromStorage;
    }
  }
  return useAuthStore.getState().accessToken?.trim() ?? "";
}
