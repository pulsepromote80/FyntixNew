import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import type { ChangeAdminPasswordFormValues } from "@/spr-admin/features/change-admin-password/schemas/changeAdminPassword.schema";
import { changeAdminPasswordService } from "@/spr-admin/features/change-admin-password/services/changeAdminPassword.service";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getMessage(value: unknown): string | null {
  if (!isRecord(value)) return null;
  for (const key of ["message", "detail", "title", "Message", "Detail", "Title"]) {
    const message = value[key];
    if (typeof message === "string" && message.trim()) return message;
  }
  return null;
}

export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: async (values: ChangeAdminPasswordFormValues) => {
      const response = await changeAdminPasswordService.change({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (
        isRecord(response) &&
        (response.success === false ||
          response.status === false ||
          (typeof response.statusCode === "number" && response.statusCode >= 400))
      ) {
        throw new Error(getMessage(response) ?? "Password could not be changed.");
      }
      return response;
    },
    onSuccess: (response) => {
      toast.success(getMessage(response) ?? "Admin password changed successfully.");
    },
    onError: (error: unknown) => {
      const apiMessage = axios.isAxiosError(error) ? getMessage(error.response?.data) : null;
      toast.error(
        apiMessage ?? (error instanceof Error ? error.message : "Failed to change admin password."),
      );
    },
  });
}
