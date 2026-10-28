import { apiClient } from "@/spr-admin/lib/api-client";

export interface BoosterHistoryPayload {
  AuthLogin: string;
  FromDate: string;
  ToDate: string;
  BoosterType: number;
}

export interface BoosterHistoryItem {
  RowNo: number;
  AuthLogin: string;
  FullName: string;
  BoosterValue: number;
  Remark: string;
  CreatedDate: string;
  email: string;
}

interface BoosterHistoryResponse {
  statusCode: number;
  message: string;
  data: {
    booster: BoosterHistoryItem[];
  };
}

export async function getBoosterHistory(
  payload: BoosterHistoryPayload,
): Promise<BoosterHistoryItem[]> {
  const response = await apiClient.post<BoosterHistoryResponse>("/admin/booster-history", payload);
  if (!Array.isArray(response.data?.booster)) {
    throw new Error("Booster history response is missing its booster list.");
  }
  return response.data.booster;
}
