/**
 * Redireciona para login quando a sessão deixa de ser válida (evita loop em `/login`).
 */
export function redirectToLoginIfNeeded(): void {
  if (typeof window === "undefined") {
    return;
  }
  if (window.location.pathname.startsWith("/login")) {
    return;
  }
  window.location.assign("/login");
}
