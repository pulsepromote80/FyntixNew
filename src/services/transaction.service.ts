import { apiClient } from "@/lib/api-client";
import type { PaginatedData, PaginationParams } from "@/types/api";

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export const transactionService = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedData<Transaction>>("/transactions", { params }),

  getById: (id: string) =>
    apiClient.get<Transaction>(`/transactions/${id}`),
};
