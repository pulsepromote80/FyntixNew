"use client";

import { Table, type TableColumn } from "@/spr-admin/components/ui/Table";
import { Pagination } from "@/spr-admin/components/ui/Pagination";
import { Skeleton } from "@/spr-admin/components/ui/Skeleton";
import { EmptyState } from "@/spr-admin/components/ui/EmptyState";
import { ErrorState } from "@/spr-admin/components/ui/ErrorState";

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
}

/**
 * Composes Table + Pagination + loading/empty/error states so feature pages
 * don't have to reimplement this boilerplate for every list view.
 */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading,
  isError,
  onRetry,
  page,
  totalPages,
  onPageChange,
  emptyTitle = "No records found",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="space-y-4">
      <Table columns={columns} data={data} getRowId={getRowId} />
      {page !== undefined && totalPages !== undefined && onPageChange && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
