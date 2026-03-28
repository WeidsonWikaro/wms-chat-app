import type { ReactElement } from "react";
import Link from "next/link";

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ChatHeader(): ReactElement {
  return (
    <CardHeader className="border-b border-border/60 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">Chat</CardTitle>
          <CardDescription>
            Streaming-ready UI — plug in your backend transport when you are
            ready.
          </CardDescription>
        </div>
        <nav
          className="flex flex-wrap gap-3 text-sm"
          aria-label="App sections"
        >
          <span className="font-medium text-foreground">Chat</span>
          <Link
            href="/api-demo"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            API demo
          </Link>
        </nav>
      </div>
    </CardHeader>
  );
}
