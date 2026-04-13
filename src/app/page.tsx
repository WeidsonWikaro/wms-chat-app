"use client";

import type { ReactElement } from "react";

import { RequireAuth } from "@/components/auth/require-auth";
import { ChatPage } from "@/components/chat/chat-page";

export default function Home(): ReactElement {
  return (
    <RequireAuth>
      <ChatPage />
    </RequireAuth>
  );
}
