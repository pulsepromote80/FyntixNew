import axios from "axios";
import { getServerEnv } from "@/spr-admin/lib/env";

/**
 * SERVER-ONLY client for the ASP.NET Core Web API backend.
 *
 * Import this ONLY inside:
 *   - Route Handlers (src/app/api/** /route.ts)
 *   - Server Components / Server Actions
 *   - Middleware (sparingly — see architecture rule: keep middleware light)
 *
 * Never import this inside a "use client" component or a browser-facing
 * service file. Browser code must go through `src/lib/axios.ts`
 * (`httpClient`), which only talks to our own `/api/*` routes.
 *
 * This file intentionally does not implement real request logic yet —
 * actual .NET integration is out of scope for this scaffold.
 */
export function createBackendClient(accessToken?: string) {
  const { SPR_ADMIN_BACKEND_API_URL } = getServerEnv();

  return axios.create({
    baseURL: SPR_ADMIN_BACKEND_API_URL,
    timeout: 15000, // 15 seconds timeout for backend calls
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}
