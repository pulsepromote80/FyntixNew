import { apiClient } from "@/spr-admin/lib/api-client";

export interface BulkRegistrationPayload {
  IntroAuthlogin: string;
  IntroSide: "L" | "R";
  FName: string;
  LName: string;
  Mobile: string;
  Email: string;
  Password: string;
  NoOfId: number;
  CountryId: string;
}

export const bulkRegistrationService = {
  getCountries: () => apiClient.get<unknown>("/admin/countries"),
  lookupReferral: (authLogin: string) =>
    apiClient.get<unknown>(`/admin/users/lookup?authLogin=${encodeURIComponent(authLogin)}`),
  register: (payload: BulkRegistrationPayload) =>
    apiClient.post<unknown, BulkRegistrationPayload>("/admin/users/bulk-registration", payload),
};
