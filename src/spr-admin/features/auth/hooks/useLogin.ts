import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/spr-admin/features/auth/services/auth.service";
import { useAuthStore } from "@/spr-admin/store/auth.store";
import { APP_ROUTES, QUERY_KEYS } from "@/spr-admin/lib/constants";
import type { LoginCredentials } from "@/spr-admin/features/auth/types";
import { menuService } from "@/spr-admin/services/menu.service";
import { dashboardService } from "@/spr-admin/services/dashboard.service";
import { useToastStore } from "@/spr-admin/store/toast.store";

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const showToast = useToastStore((state) => state.showToast);
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (user) => {
      setUser(user);
      showToast("Login successful");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });

      // Prefetch data for instant dashboard loading
      void Promise.all([
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.menu,
          queryFn: menuService.getMenu,
        }),
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.dashboard.summary,
          queryFn: dashboardService.getSummary,
        }),
      ]).catch((error: unknown) => {
        console.error("Prefetch error:", error);
      });

      router.replace(APP_ROUTES.dashboard);
      router.refresh();
    },
  });
}
