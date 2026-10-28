import { apiClient } from "@/spr-admin/lib/api-client";

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface AccountStatementPayload {
  AuthLogin: string;
  transtype: string;      // 👈 lowercase, camelCase nahi
  FromDate: string;
  ToDate: string;
  wtype: number;          // 👈 number (0 default), string nahi
}

export interface AccountStatementRow {
  statusCode: number;
  message: string;
  RowNo: number;
  AuthLogin: string;
  FullName: string;
  Credit: number;
  Debit: number;
  TransType: string;
  Remark: string;
  TransDate: string;
  TransDate2: string;
  CreatedDate: string;
  ApprovalDate: string;
  email: string;
}

export interface TransTypeItem {
  Statuscode: number;
  message: string;
  transType: string;
}

export interface TransTypeData {
  incomeTransTypes: TransTypeItem[];
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

export const getTransTypes = (
  type: number
): Promise<ApiResponse<TransTypeData>> => {
  return apiClient.get<ApiResponse<TransTypeData>>(
    `/admin/trans-types?Type=${type}`
  );
};
export const getAccountStatement = (
  payload: AccountStatementPayload
): Promise<ApiResponse<AccountStatementRow[]>> => {
  return apiClient.post<ApiResponse<AccountStatementRow[]>>(
    "/admin/statement",
    payload
  );
};