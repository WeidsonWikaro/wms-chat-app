/**
 * Base URL da API Nest (inclui o prefixo `/api`).
 * Defina `NEXT_PUBLIC_API_URL` no `.env` (veja `.env.example`).
 * Usada pelo `apiClient` (Axios) e pelos serviços HTTP.
 *
 * @example http://localhost:3001/api
 */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  return raw.replace(/\/$/, "");
}
