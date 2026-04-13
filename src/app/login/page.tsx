"use client";

import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseAxiosErrorMessage } from "@/lib/api/http";
import { loginRequest } from "@/lib/auth/auth-api";
import { getAuthAccessTokenSync } from "@/lib/auth/auth-access";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function LoginPage(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gateReady, setGateReady] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrateFromSession();
    setGateReady(true);
  }, []);

  useEffect(() => {
    if (!gateReady) {
      return;
    }
    if (getAuthAccessTokenSync().length > 0) {
      router.replace("/");
    }
  }, [gateReady, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const code = email.trim();
      if (code.length === 0 || password.length === 0) {
        setError("Preencha o e-mail e a palavra-passe.");
        return;
      }
      setIsSubmitting(true);
      try {
        const tokens = await loginRequest({ code, password });
        useAuthStore.getState().setSession({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
        router.replace("/");
      } catch (err) {
        setError(parseAxiosErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, router]
  );

  if (!gateReady) {
    return (
      <div className="flex h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
        <p className="text-sm">A carregar…</p>
      </div>
    );
  }

  if (getAuthAccessTokenSync().length > 0) {
    return (
      <div className="flex h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
        <p className="text-sm">A redirecionar…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-950 px-4 py-10">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100 ring-zinc-800">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-xl text-white">Iniciar sessão</CardTitle>
          <CardDescription className="text-zinc-400">
            Assistente WMS — utilize o seu e-mail ou código de utilizador e a
            palavra-passe.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-zinc-200"
              >
                E-mail
              </label>
              <Input
                id="login-email"
                name="email"
                type="text"
                inputMode="email"
                autoComplete="username"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="ex.: utilizador@empresa.pt"
                disabled={isSubmitting}
                className="border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
                aria-invalid={error !== null}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-zinc-200"
              >
                Palavra-passe
              </label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                disabled={isSubmitting}
                className="border-zinc-700 bg-zinc-950 text-zinc-100"
                aria-invalid={error !== null}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            {error ? (
              <p
                id="login-error"
                role="alert"
                className="text-sm text-red-400"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-9 w-full bg-emerald-700 text-white hover:bg-emerald-600"
            >
              {isSubmitting ? "A entrar…" : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
