import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/spr-admin/features/transactions/services/transaction.service";
import { QUERY_KEYS } from "@/spr-admin/lib/constants";
import type { PaginationParams } from "@/spr-admin/types/api";

export function useTransactions(params?: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.transactions.all, params],
    queryFn: () => transactionService.list(params),
  });
}
