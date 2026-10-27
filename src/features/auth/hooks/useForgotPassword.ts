import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { authService } from "@/features/auth/services/auth.service";
import type { ForgotPasswordPayload } from "@/types/auth";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error instanceof Error && error.message) return error.message;
  return "Failed to send reset link";
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      const response = await authService.forgotPassword(payload);
      if (response.statusCode !== 200) {
        throw new Error(response.message || "Failed to send reset link");
      }
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Password reset link sent successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}
