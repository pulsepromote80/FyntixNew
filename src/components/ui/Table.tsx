import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
}

export function Table<T>({ columns, data, getRowId, isLoading }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("px-2 sm:px-4 py-2 sm:py-3 font-medium text-muted-foreground whitespace-nowrap", column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#F5C451]" aria-label="Loading" />
              </td>
              </tr>
          ) : (
            data.map((row, index) => (
              <tr key={getRowId(row)} className="hover:bg-muted/30">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-2 sm:px-4 py-2 sm:py-3 text-foreground whitespace-nowrap", column.className)}>
                    {column.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
