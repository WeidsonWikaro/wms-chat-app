/**
 * Hora local (pt-BR) para exibir abaixo do balão.
 * Preferência: ISO do servidor/cliente; fallback: `createdAt` em ms.
 */
export function formatMessageTimeLabel(
  sentAtIso: string | undefined,
  createdAt: number
): string {
  const d = sentAtIso !== undefined ? new Date(sentAtIso) : new Date(createdAt);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
