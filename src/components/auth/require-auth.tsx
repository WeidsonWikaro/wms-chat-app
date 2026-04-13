"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";

import { getAuthAccessTokenSync } from "@/lib/auth/auth-access";
import { useAuthStore } from "@/lib/auth/auth-store";

function subscribeNoop(): () => void {
  return (): void => {};
}

function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export interface RequireAuthProps {
  readonly children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps): ReactElement {
  const router = useRouter();
  const isClient = useIsClient();
  const accessFromStore = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!isClient) {
      return;
    }
    useAuthStore.getState().hydrateFromSession();
  }, [isClient]);

  const token = isClient ? getAuthAccessTokenSync() : "";

  useEffect(() => {
    if (!isClient) {
      return;
    }
    if (token.length === 0) {
      router.replace("/login");
    }
  }, [isClient, token, router, accessFromStore]);

  if (!isClient) {
    return (
      <div className="flex h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
        <p className="text-sm">A carregar…</p>
      </div>
    );
  }

  if (token.length === 0) {
    return (
      <div className="flex h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
        <p className="text-sm">A redirecionar…</p>
      </div>
    );
  }

  return <>{children}</>;
}
