import axios from "axios";

/**
 * Browser-side Axios instance.
 *
 * This instance ONLY ever talks to our own Next.js Route Handlers under
 * `/api/*`. It must never be pointed at the external .NET backend directly —
 * that URL is server-only (see `src/lib/env.ts`) and is used exclusively
 * inside Route Handlers (see `src/app/api/**`).
 *
 * `withCredentials` ensures the HttpOnly session cookie is sent with every
 * same-origin request so the Route Handlers can forward/validate it.
 */
export const httpClient = axios.create({
  baseURL: "/api/spr-admin",
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout for faster failure
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Centralized place to react to session expiry, e.g. redirect to
      // /login or clear client-side auth state. Kept intentionally minimal
      // until the real backend is wired up.
    }
    return Promise.reject(error);
  },
);
