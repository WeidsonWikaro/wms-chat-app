import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Iniciar sessão — Chat",
  description: "Autenticação para o Assistente WMS.",
};

export default function LoginLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactNode {
  return children;
}
