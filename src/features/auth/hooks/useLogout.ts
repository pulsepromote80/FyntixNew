import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { QUERY_KEYS } from "@/lib/constants";

export function useLogout() {
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call logout API to clear the session cookie
      await authService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    }

    // Clear user state after API call
    clearUser();
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });

    // Redirect to login page
    router.push("/login");
  };

  return {
    mutate: handleLogout,
    isPending: false,
  };
}
