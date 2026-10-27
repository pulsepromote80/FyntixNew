import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { QUERY_KEYS } from "@/lib/constants";
import type { LoginCredentials } from "@/features/auth/types";

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
      toast.success("Login successful!");
      
      // Redirect to the page the user was trying to access, or dashboard
      const from = searchParams.get("from");
      router.push(from || "/dashboard");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      // Suppress the specific 401 error message about incorrect credentials
      if (errorMessage !== "Details are incorrect, please enter correct credentials.") {
        toast.error(errorMessage || "Invalid userid or password");
      }
    },
  });
}
