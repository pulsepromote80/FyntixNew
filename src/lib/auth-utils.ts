import { useAuthStore } from "@/store/auth.store";

/**
 * Get user ID from auth store (client-side)
 */
export function getUserId(): string | null {
  const user = useAuthStore.getState().user;
  return user?.id || null;
}
