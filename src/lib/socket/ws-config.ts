/**
 * Base HTTP do servidor Nest (sem `/api`, sem namespace `/chat`).
 * @example http://localhost:3001
 */
export function getWsBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_WS_BASE ?? "http://localhost:3001";
  return raw.replace(/\/$/, "");
}
