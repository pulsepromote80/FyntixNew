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

export interface UpdateUserProfilePayload {
  LoginID: string;
  FName: string;
  LName: string;
  Address: string;
  Email: string;
  mobile: string;
  countryid: number;
  WalletBep20: string;
}
export interface Country {
  Country_Id: number;
  Country_Code: string;
  Country_Name: string;
  phonecode: number;
  IsActive: boolean;
  CountryFlag: string;
}

export const getUserByAuthLogin = (
  authLogin: string
): Promise<ApiResponse<UserNameByLoginIdResponse>> => {
  return apiClient.get<ApiResponse<UserNameByLoginIdResponse>>(
    `/admin/users/editUser?authLogin=${encodeURIComponent(authLogin)}`
  );
};

export const updateUserProfile = (
  payload: UpdateUserProfilePayload
): Promise<ApiResponse<unknown>> => {
  return apiClient.post<ApiResponse<unknown>>(
    "/admin/users/editUser",   
    payload
  );
};
export const getAllCountries = (): Promise<ApiResponse<Country[]>> => {
  return apiClient.get<ApiResponse<Country[]>>("/admin/users/countries");
};