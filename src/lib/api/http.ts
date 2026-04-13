import axios, { isAxiosError } from "axios";

import { apiClient } from "@/lib/api/axios-instance";

function parseBodyMessage(text: string, status: number): string {
  if (!text) {
    return `Request failed (${status})`;
  }
  try {
    const body = JSON.parse(text) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }
    if (typeof body.message === "string") {
      return body.message;
    }
    if (typeof body.error === "string") {
      return body.error;
    }
  } catch {
    return text;
  }
  return text;
}

export function parseAxiosErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : "Something went wrong.";
  }
  const status = error.response?.status ?? 0;
  const raw = error.response?.data;
  if (raw === undefined || raw === null) {
    return error.message || `Request failed (${status})`;
  }
  if (typeof raw === "string") {
    return parseBodyMessage(raw, status);
  }
  if (typeof raw === "object") {
    const o = raw as { message?: string | string[]; error?: string };
    if (Array.isArray(o.message)) {
      return o.message.join(", ");
    }
    if (typeof o.message === "string") {
      return o.message;
    }
    if (typeof o.error === "string") {
      return o.error;
    }
  }
  return error.message || `Request failed (${status})`;
}

/**
 * Cliente JSON genérico (CRUD) sobre o `apiClient` Axios.
 * Mantém a assinatura compatível com os serviços existentes.
 */
export async function fetchJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const method = (init?.method ?? "GET").toUpperCase();
  let parsedBody: unknown = undefined;
  if (init?.body !== undefined && init?.body !== null) {
    if (typeof init.body === "string") {
      const raw = init.body;
      parsedBody = raw.length > 0 ? (JSON.parse(raw) as unknown) : undefined;
    } else {
      parsedBody = init.body;
    }
  }
  try {
    const response = await apiClient.request<T>({
      url: normalized,
      method: method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
      data:
        method === "GET" || method === "DELETE" ? undefined : parsedBody,
    });
    if (response.status === 204) {
      return undefined as T;
    }
    if (response.data === "" || response.data === undefined) {
      return undefined as T;
    }
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }
    throw new Error(parseAxiosErrorMessage(error));
  }
}
