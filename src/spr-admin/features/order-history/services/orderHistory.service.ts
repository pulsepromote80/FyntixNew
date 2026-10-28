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

// ============================================
// Request payload
// ============================================
export interface OrderHistoryPayload {
  AuthLogin: string;
  Statusid: string;
  FromDate: string;
  ToDate: string;
}

// ============================================
// Response — single order item
// ============================================
export interface OrderHistoryItem {
  Loginid: string;
  Name: string;
  PackageName: string;
  RegDate: string;
  Mobile: string;
  Email: string;
  LicenseAmount: number;
  LicenseDate: string;
  TopupedBy: string;
  Referralid: string;
  Position: string;
  DurationOnMonth: number;
  TotalReturn: number;
  WeeklyReturn: number;
}
export const getUserByAuthLogin = (
  authLogin: string,
): Promise<ApiResponse<UserNameByLoginIdResponse>> => {
  return apiClient.get<ApiResponse<UserNameByLoginIdResponse>>(
    `/admin/users/editUser?authLogin=${encodeURIComponent(authLogin)}`,
  );
};

// ============================================
// Response shape
// ============================================
export type OrderHistoryResponse = ApiResponse<OrderHistoryItem[]>;

// ============================================
// API call
// ============================================
export const getOrderHistory = (payload: OrderHistoryPayload): Promise<OrderHistoryResponse> => {
  return apiClient.post<OrderHistoryResponse>(`/admin/orderHistory`, payload);
};
