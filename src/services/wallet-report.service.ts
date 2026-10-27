import { apiClient } from "@/lib/api-client";

export interface TransactionHistory {
  ID?: number;
  CreatedDate?: string;
  credit?: number;
  debit?: number;
  transType?: string;
  Remark?: string;
 
}

export const walletReportService = {
  getTransactionHistory: async (transType: string): Promise<TransactionHistory[]> => {
    const response = await apiClient.post<{ data?: TransactionHistory[] }>(
      "/wallet-manager/income",
      { transtype: transType }
    );
    return response.data || [];
  },
};
