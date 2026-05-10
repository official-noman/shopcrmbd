const ACCESS_KEY = "shopcrm_access_token";
const REFRESH_KEY = "shopcrm_refresh_token";
const ACCESS_COOKIE = "shopcrm_access";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

function setCookie(name: string, value: string) {
  // Basic cookie for middleware checks (not HttpOnly since set client-side).
  // In production, consider HttpOnly cookies set server-side on login.
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function setTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_KEY, access);
  setCookie(ACCESS_COOKIE, access);
  if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  clearCookie(ACCESS_COOKIE);
}

