"use client";

import { Loader2 } from "lucide-react";
import type { ReactElement } from "react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

export interface HealthErrorDialogProps {
  readonly open: boolean;
  readonly isRetrying: boolean;
  readonly onRetry: () => void;
}

export function HealthErrorDialog({
  open,
  isRetrying,
  onRetry,
}: HealthErrorDialogProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      dialog.close();
    }
  }, [open]);

  const handleRetry = (): void => {
    onRetry();
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 text-left shadow-xl [&::backdrop]:bg-black/55"
      aria-labelledby="health-error-title"
      aria-describedby="health-error-desc"
    >
      <h2
        id="health-error-title"
        className="text-lg font-semibold tracking-tight text-zinc-900"
      >
        Conexão com o servidor
      </h2>
      <p
        id="health-error-desc"
        className="mt-3 text-sm leading-relaxed text-zinc-600"
      >
        Desculpe! Não consegui conectar ao servidor. Tente novamente mais tarde
        ou fale com seu supervisor.
      </p>
      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800"
          aria-busy={isRetrying}
        >
          {isRetrying ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          Tentar novamente
        </Button>
      </div>
    </dialog>
  );
}
