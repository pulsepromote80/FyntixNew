import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/features/transactions/services/transaction.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { PaginationParams } from "@/types/api";

export function useTransactions(params?: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.transactions.all, params],
    queryFn: () => transactionService.list(params),
  });
}
