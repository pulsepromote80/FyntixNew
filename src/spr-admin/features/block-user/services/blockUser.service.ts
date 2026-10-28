import { apiClient } from "@/spr-admin/lib/api-client";

export interface BlockUserPayload {
  authLogin: string;
  active: 0 | 1;
}

export const blockUserService = {
  lookup: (authLogin: string) =>
    apiClient.get<unknown>("/admin/users/lookup", {
      params: { authLogin },
    }),
  updateStatus: (payload: BlockUserPayload) =>
    apiClient.post<unknown, undefined>("/admin/users/block", undefined, {
      params: {
        authLogin: payload.authLogin,
        active: payload.active,
      },
    }),
};
