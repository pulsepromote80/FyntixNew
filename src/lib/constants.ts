/**
 * App-wide constants that are not environment-specific.
 * Feature-specific constants belong in `src/features/<feature>/constants.ts`.
 */

export const APP_ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  profile: "/profile",
  users: "/users",
  transactions: "/transactions",
  settings: "/settings",
} as const;

export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
  },
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    detail: (id: string) => ["transactions", id] as const,
  },
  orderHistory: {
    all: ["orderHistory"] as const,
    booster: ["orderHistory", "booster"] as const,
  },
} as const;

export const DEFAULT_PAGE_SIZE = 20;
