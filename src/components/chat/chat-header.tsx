"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useCallback, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutRequest } from "@/lib/auth/auth-api";
import { useAuthStore } from "@/lib/auth/auth-store";

export function ChatHeader(): ReactElement {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken !== null && refreshToken.length > 0) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        /* melhor esforço: sessão local é sempre limpa */
      }
    }
    useAuthStore.getState().clearSession();
    router.replace("/login");
    setIsLoggingOut(false);
  }, [isLoggingOut, router]);

  const handleLogoutKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        void handleLogout();
      }
    },
    [handleLogout]
  );

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-emerald-950/20 bg-emerald-900 px-4 py-3 text-white shadow-md">
      <Avatar>
        <AvatarFallback className="bg-emerald-700 text-sm font-semibold text-white">
          AW
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold leading-tight">
          Assistente WMS
        </h1>
        <p className="text-xs text-emerald-100/90">online</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => void handleLogout()}
        onKeyDown={handleLogoutKeyDown}
        disabled={isLoggingOut}
        className="shrink-0 text-white hover:bg-emerald-800/80 hover:text-white"
        aria-label="Terminar sessão"
      >
        <LogOut className="size-5" aria-hidden />
      </Button>
    </header>
  );
}
