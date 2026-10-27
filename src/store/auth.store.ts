import { create } from "zustand";

/**
 * Client-side UI-facing auth state ONLY.
 *
 * IMPORTANT: This store never holds the access token or any sensitive
 * credential — those live exclusively in the HttpOnly session cookie set by
 * the server. This store just mirrors non-sensitive user info (id, name,
 * email, roles) for fast client-side reads (e.g. showing a name in the
 * navbar) after it has been fetched from `/api/auth/me` via TanStack Query.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
