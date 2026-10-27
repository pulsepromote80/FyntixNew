import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * Fetches the currently authenticated user via /api/auth/me.
 * Session validity is enforced server-side; this hook just surfaces the
 * result for client components (e.g. showing the user's name in the navbar).
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: authService.me,
    retry: false,
  });
}
