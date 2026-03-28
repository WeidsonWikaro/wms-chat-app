import axios from "axios";

import { getApiBaseUrl } from "@/lib/api/config";

/**
 * Cliente HTTP único para a API externa (base URL inclui `/api`).
 * Use em chamadas com React Query ou serviços; evite duplicar `baseURL`.
 */
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: (status) => status >= 200 && status < 300,
});
