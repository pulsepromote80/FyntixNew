import { apiClient } from "@/spr-admin/lib/api-client";

export interface ChangeUserPasswordPayload {
  LoginId: string;
  OldPassword: string;
  NewPass: string;
}

export const adminUsersService = {
  changePassword: (payload: ChangeUserPasswordPayload) =>
    apiClient.post<unknown, ChangeUserPasswordPayload>(
      "/admin/users/change-password",
      payload,
    ),
};
