import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { adminUsersService } from "@/spr-admin/features/change-password/services/adminUsers.service";
import type { ChangeUserPasswordFormValues } from "@/spr-admin/features/change-password/schemas/changePassword.schema";
import { useToastStore } from "@/spr-admin/store/toast.store";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getResponseMessage(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }
  for (const key of ["message", "detail", "title", "Message", "Detail", "Title"]) {
    const message = value[key];
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return null;
}

function isRejectedResponse(value: unknown): boolean {
  return (
    isRecord(value) &&
    (value.success === false ||
      value.status === false ||
      (typeof value.statusCode === "number" && value.statusCode >= 400))
  );
}

export function useChangeUserPassword() {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: async (values: ChangeUserPasswordFormValues) => {
      const response = await adminUsersService.changePassword({
        LoginId: values.loginId.trim(),
        OldPassword: values.currentPassword,
        NewPass: values.newPassword,
      });

      if (isRejectedResponse(response)) {
        throw new Error(
          getResponseMessage(response) ?? "The password could not be changed.",
        );
      }
      return response;
    },
    onSuccess: (response) => {
      showToast(getResponseMessage(response) ?? "User password changed successfully.");
    },
    onError: (error: unknown) => {
      const responseMessage = axios.isAxiosError(error)
        ? getResponseMessage(error.response?.data)
        : null;
      const message =
        responseMessage ??
        (error instanceof Error ? error.message : "Failed to change user password.");
      showToast(message, "error");
    },
  });
}
