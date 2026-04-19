/** Trang không cần đăng nhập (auth / password flows). */
const PUBLIC_AUTH_ROUTES = ["/login", "/register", "/password/forgot", "/password/reset"] as const;

export function isPublicAuthRoute(pathname: string): boolean {
  return PUBLIC_AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export const DEFAULT_LOGGED_IN_ROUTE = "/dashboard";

/** Tránh open redirect; không đưa user quay lại trang auth sau login. */
export function safePostLoginPath(next: string | null | undefined, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("\\") || /:/.test(next)) return fallback;
  if (isPublicAuthRoute(next)) return fallback;
  return next;
}
