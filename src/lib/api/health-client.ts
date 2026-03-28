import { fetchJson } from "@/lib/api/http";

export interface HealthResponse {
  readonly status: string;
  readonly service: string;
  readonly timestamp: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>("/health");
}
