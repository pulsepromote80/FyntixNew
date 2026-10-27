import { apiClient } from "@/lib/api-client";

export interface OrderHistoryItem {
  Authlogin: string;
  FullName: string;
  ProductId: string;
  RDate: string;
  ProductName: string;
  Rkprice: number;
  PackageName: string;
  CreatedDate: string;
  IsDist: string | null;
  Paymentmode: string;
  IsExpire: string | null;
  Remark: string;
  Active: boolean;
}

export interface BoosterOrderHistoryItem {
  ActivationDate: string;
  BoosterValue: number;
  BoosterStatus: string;
  Btype: string;
}

export const orderHistoryService = {
  list: (type?: string) =>
    apiClient.get<{ statusCode: number; message: string; data: OrderHistoryItem[] }>(
      "/FundManager/recharge-details",
      { params: type ? { Type: type } : undefined }
    ),
  getBoosterOrderHistory: () =>
    apiClient.get<{ statusCode: number; message: string; data: BoosterOrderHistoryItem[] }>(
      "/FundManager/booster-history"
    ),
};
