import { create } from "zustand";

/**
 * Store global mínima; estenda com slices (tema, sessão, etc.) quando necessário.
 */
export const useAppStore = create<object>(() => ({}));
