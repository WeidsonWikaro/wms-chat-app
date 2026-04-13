import type { InternalAxiosRequestConfig } from "axios";

import { apiClient } from "@/lib/api/axios-instance";
import { refreshAccessTokenRequest } from "@/lib/auth/auth-api";
import { getAuthAccessTokenSync } from "@/lib/auth/auth-access";
import { redirectToLoginIfNeeded } from "@/lib/auth/auth-navigation";
import { useAuthStore } from "@/lib/auth/auth-store";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let installed = false;

export function setupApiAuthInterceptors(): void {
  if (installed) {
    return;
  }
  installed = true;

  apiClient.interceptors.request.use((config) => {
    const token = getAuthAccessTokenSync();
    if (token.length > 0) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const err = error as {
        config?: RetryConfig;
        response?: { status?: number };
      };
      const config = err.config;
      const status = err.response?.status;
      if (!config || status !== 401 || config._retry) {
        return Promise.reject(error);
      }
      const url = config.url ?? "";
      if (
        url.includes("auth/login") ||
        url.includes("auth/refresh") ||
        url.includes("auth/logout") ||
        url.includes("/chat/dev-token")
      ) {
        return Promise.reject(error);
      }
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clearSession();
        redirectToLoginIfNeeded();
        return Promise.reject(error);
      }
      config._retry = true;
      try {
        const tokens = await refreshAccessTokenRequest(refreshToken);
        useAuthStore.getState().setSession({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? refreshToken,
        });
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return apiClient(config);
      } catch {
        useAuthStore.getState().clearSession();
        redirectToLoginIfNeeded();
        return Promise.reject(error);
      }
    }
  );
}
