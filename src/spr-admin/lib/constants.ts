export const APP_ROUTES = {
  home: "/spr-admin",
  login: "/spr-admin/login",
  forgotPassword: "/spr-admin/forgot-password",
  resetPassword: "/spr-admin/reset-password",
  dashboard: "/spr-admin/dashboard",
  profile: "/spr-admin/profile",
  users: "/spr-admin/users",
  blockUser: "/spr-admin/block-user",
  transactions: "/spr-admin/transactions",
  settings: "/spr-admin/settings",
} as const;

export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  menu: ["menu"] as const,
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
} as const;

export const DEFAULT_PAGE_SIZE = 20;
