import { apiClient } from "@/lib/api/axios-instance";

export interface HealthResponse {
  readonly status: string;
  readonly service: string;
  readonly timestamp: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/health");
  return data;
}
