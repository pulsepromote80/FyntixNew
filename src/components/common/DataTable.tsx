"use client";

import { Table, type TableColumn } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

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
  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (data.length === 0 && !isLoading) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={isLoading ? [] : data}
        getRowId={getRowId}
        isLoading={isLoading}
      />
      {page !== undefined && totalPages !== undefined && onPageChange && !isLoading && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
