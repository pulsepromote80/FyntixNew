"use client";

import { useState } from "react";
import { Badge } from "@/spr-admin/components/ui/Badge";
import { DataTable } from "@/spr-admin/components/common/DataTable";
import { useTransactions } from "@/spr-admin/features/transactions/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/spr-admin/lib/utils";
import type { Transaction } from "@/spr-admin/features/transactions/types";
import type { TableColumn } from "@/spr-admin/components/ui/Table";
import { DEFAULT_PAGE_SIZE } from "@/spr-admin/lib/constants";

const STATUS_VARIANT = {
  pending: "warning",
  completed: "success",
  failed: "destructive",
} as const;

const columns: TableColumn<Transaction>[] = [
  { key: "reference", header: "Reference", render: (tx) => tx.reference },
  { key: "amount", header: "Amount", render: (tx) => formatCurrency(tx.amount) },
  {
    key: "status",
    header: "Status",
    render: (tx) => <Badge variant={STATUS_VARIANT[tx.status]}>{tx.status}</Badge>,
  },
  { key: "createdAt", header: "Date", render: (tx) => formatDate(tx.createdAt) },
];

export function TransactionsTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useTransactions({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  return (
    <DataTable<Transaction>
      columns={columns}
      data={data?.items ?? []}
      getRowId={(tx) => tx.id}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      page={data?.page ?? page}
      totalPages={data?.totalPages ?? 1}
      onPageChange={setPage}
      emptyTitle="No transactions yet"
    />
  );
}
