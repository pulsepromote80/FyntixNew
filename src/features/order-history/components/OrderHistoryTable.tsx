"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/common/DataTable";
import { useOrderHistory, useBoosterOrderHistory } from "@/features/order-history/hooks/useOrderHistory";
import { formatCurrency } from "@/lib/utils";
import type { OrderHistoryItem, BoosterOrderHistoryItem } from "@/services/order-history.service";
import type { TableColumn } from "@/components/ui/Table";

const columns: TableColumn<OrderHistoryItem>[] = [
  { key: "sno", header: "S.No", render: (_, index) => index + 1 },
  { key: "ProductName", header: "Package Type", render: (item) => item.ProductName },
  { key: "Rkprice", header: "Amount", render: (item) => formatCurrency(item.Rkprice) },
  { key: "Paymentmode", header: "Payment Mode", render: (item) => item.Paymentmode },
  { key: "RDate", header: "Order Date", render: (item) => item.RDate },

  {
    key: "Active",
    header: "Status",
    render: (item) => (
      <Badge variant={item.Active ? "success" : "destructive"}>
        {item.Active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  { key: "Remark", header: "Remark", render: (item) => item.Remark },
];

type TabType = "investment-fund";

export function OrderHistoryTable() {
  const [activeTab, setActiveTab] = useState<TabType>("investment-fund");
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Fetch all data without filter
  const { data: allData, isLoading, isError, refetch } = useOrderHistory();
  
  // Extract unique ProductName values for filter options
  const filterOptions = useMemo(() => {
    if (!allData?.data) return [];
    const uniqueProductNames = Array.from(
      new Set(allData.data.map((item) => item.ProductName))
    );
    return uniqueProductNames.map((name) => ({
      value: name,
      label: name,
    }));
  }, [allData?.data]);
  
  // Client-side filtering by ProductName
  const filteredDisplayData = useMemo(() => {
    if (!filterType || !allData?.data) return allData?.data ?? [];
    return allData.data.filter((item) => item.ProductName === filterType);
  }, [filterType, allData?.data]);

  return (
    <div className="space-y-4">
    

      {activeTab === "investment-fund" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <select
              value={filterType ?? ""}
              onChange={(e) => setFilterType(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <DataTable<OrderHistoryItem>
            columns={columns}
            data={filteredDisplayData}
            getRowId={(item) => `${item.ProductId}-${item.RDate}`}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            emptyTitle="No order history found"
          />
        </div>
      )}

    </div>
  );
}
