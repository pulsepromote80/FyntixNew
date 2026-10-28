import { apiClient } from "@/spr-admin/lib/api-client";

export interface ChangeAdminPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changeAdminPasswordService = {
  change: (payload: ChangeAdminPasswordPayload) =>
    apiClient.post<unknown, ChangeAdminPasswordPayload>(
      "/AdminAuthentication/changeAdminPassword",
      payload,
    ),
};
