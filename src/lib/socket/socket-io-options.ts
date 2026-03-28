/** Alinhado ao Nest: em produção só WebSocket; em dev deixa o default (polling+ws) para facilitar proxies. */
export function getSocketIoTransports(): string[] | undefined {
  return process.env.NODE_ENV === "production" ? ["websocket"] : undefined;
}
