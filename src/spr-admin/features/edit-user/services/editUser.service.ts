import { apiClient } from "@/spr-admin/lib/api-client";

export const editUserService = {
  lookup: (authLogin: string) =>
    apiClient.get<unknown>(`/admin/users/lookup?authLogin=${encodeURIComponent(authLogin)}`),
};
