import { apiClient } from "@/spr-admin/lib/api-client";

export interface SearchAllUsersPayload {
  AuthLogin: string;
  Fname: string;
  Active: string;
  Mobile: string;
  Email: string;
  Kid: string;
  Walletid: string;
  FromDate: string;
  ToDate: string;
}

function formatBackendDate(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

export const adminUsersService = {
  search: (payload: SearchAllUsersPayload) =>
    apiClient.post<unknown, SearchAllUsersPayload>("/admin/users/search", {
      ...payload,
      FromDate: formatBackendDate(payload.FromDate),
      ToDate: formatBackendDate(payload.ToDate),
    }),
};
