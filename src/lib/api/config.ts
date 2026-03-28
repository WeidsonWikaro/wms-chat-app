/**
 * Base URL for the Nest API (includes `/api` prefix). Example: http://localhost:3001/api
 */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  return raw.replace(/\/$/, "");
}
