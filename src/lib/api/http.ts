import { getApiBaseUrl } from "@/lib/api/config";

function parseErrorMessage(text: string, status: number): string {
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

export async function fetchJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalized}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseErrorMessage(text, res.status));
  }
  if (res.status === 204 || text.length === 0) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
