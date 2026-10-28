import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/spr-admin/features/auth/services/auth.service";
import { useAuthStore } from "@/spr-admin/store/auth.store";
import { APP_ROUTES, QUERY_KEYS } from "@/spr-admin/lib/constants";

export function useLogout() {
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearUser();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
      router.push(APP_ROUTES.login);
      router.refresh();
    },
  });
}
