import axios from "axios";
import { getAccessToken } from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1/",
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (typeof window !== "undefined" && status === 401) {
      try {
        window.localStorage.removeItem("shopcrm_access_token");
        window.localStorage.removeItem("shopcrm_refresh_token");
        document.cookie = "shopcrm_access=; Path=/; Max-Age=0; SameSite=Lax";
      } catch {}
      const next = window.location.pathname + window.location.search;
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
    }
    return Promise.reject(error);
  }
);

