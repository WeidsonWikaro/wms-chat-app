import type { ReactElement } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ChatHeader(): ReactElement {
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
    </header>
  );
}
