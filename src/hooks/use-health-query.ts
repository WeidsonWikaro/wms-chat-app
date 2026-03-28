"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchHealth } from "@/lib/api/health-client";
import { queryKeys } from "@/lib/query/query-keys";

export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: fetchHealth,
    staleTime: 60_000,
    retry: 1,
  });
}
