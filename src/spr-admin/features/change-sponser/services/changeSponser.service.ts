import { apiClient } from "@/spr-admin/lib/api-client";

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface UserNameByLoginIdResponse {
  FName: string;
  LName: string;
  Email: string;
  WalletBep20: string | null;
  Address: string;
  Mobile: string;
  Country_Name: string;
  phonecode: string;
  CountryId: number;
  ProfileImage: string | null;
}

export const getUserByAuthLogin = (
  authLogin: string
): Promise<ApiResponse<UserNameByLoginIdResponse>> => {
  return apiClient.get<ApiResponse<UserNameByLoginIdResponse>>(
    `/admin/users/editUser?authLogin=${encodeURIComponent(authLogin)}`
  );
};

export interface ChangeSponsorPayload {
  AuthLogin: string;
  SponsorAuthLogin: string;
}

export interface ChangeSponsorResponse {
  statusCode: number;
  message: string;
  data: null;
}


export const changeAdminSponsor = (
  payload: ChangeSponsorPayload
): Promise<ChangeSponsorResponse> => {
  return apiClient.post<ChangeSponsorResponse>(
    `/admin/changeSponsor`,
    payload
  );
};