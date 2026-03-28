/**
 * Chaves estáveis para React Query — evita typos e facilita invalidação.
 */
export const queryKeys = {
  all: ["api"] as const,
  health: () => [...queryKeys.all, "health"] as const,
} as const;
