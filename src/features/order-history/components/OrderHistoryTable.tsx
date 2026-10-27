"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/common/DataTable";
import { useOrderHistory, useBoosterOrderHistory } from "@/features/order-history/hooks/useOrderHistory";
import { formatCurrency } from "@/lib/utils";
import type { OrderHistoryItem, BoosterOrderHistoryItem } from "@/services/order-history.service";
import type { TableColumn } from "@/components/ui/Table";

const columns: TableColumn<OrderHistoryItem>[] = [
  { key: "sno", header: "S.No", render: (_, index) => index + 1 },
  { key: "Authlogin", header: "Login ID", render: (item) => item.Authlogin },
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

const boosterColumns: TableColumn<BoosterOrderHistoryItem>[] = [
  { key: "sno", header: "S.No", render: (_, index) => index + 1 },
  { key: "ActivationDate", header: "Activation Date", render: (item) => item.ActivationDate },
  { key: "Btype", header: "Booster Type", render: (item) => item.Btype },
  { key: "BoosterValue", header: "Booster Value", render: (item) => formatCurrency(item.BoosterValue) },
  {
    key: "BoosterStatus",
    header: "Status",
    render: (item) => (
      <Badge variant={item.BoosterStatus === "Active" ? "success" : "destructive"}>
        {item.BoosterStatus}
      </Badge>
    ),
  },
];

type FilterType = "1" | "2" | "3" | null;

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "Trading" },
  { value: "2", label: "Legacy Reborn" },
  { value: "3", label: "Legacy Reborn 2.0" },
];

type TabType = "investment-fund" | "booster";

export function OrderHistoryTable() {
  const [activeTab, setActiveTab] = useState<TabType>("investment-fund");
  const [filterType, setFilterType] = useState<FilterType>(null);
  const { data, isLoading, isError, refetch } = useOrderHistory(filterType ?? undefined);
  const { data: boosterData, isLoading: isBoosterLoading, isError: isBoosterError, refetch: refetchBooster } = useBoosterOrderHistory();

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-0.5 flex space-x-0.5">
        <button
          onClick={() => setActiveTab("investment-fund")}
          className={`flex-1 py-3 px-2 rounded-sm font-medium text-xs transition-all duration-200 ${
            activeTab === "investment-fund"
              ? "bg-[#F3A31F] text-black font-bold shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Investment Fund
        </button>
        <button
          onClick={() => setActiveTab("booster")}
          className={`flex-1 py-3 px-2 rounded-sm font-medium text-xs transition-all duration-200 ${
            activeTab === "booster"
              ? "bg-[#F3A31F] text-black font-bold shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Booster
        </button>
      </div>

      {activeTab === "investment-fund" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <select
              value={filterType ?? ""}
              onChange={(e) => setFilterType(e.target.value as FilterType || null)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <DataTable<OrderHistoryItem>
            columns={columns}
            data={data?.data ?? []}
            getRowId={(item) => item.ProductId}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            emptyTitle="No order history found"
          />
        </div>
      )}

      {activeTab === "booster" && (
        <DataTable
          columns={boosterColumns}
          data={boosterData?.data ?? []}
          getRowId={(item: BoosterOrderHistoryItem) => `${item.ActivationDate}-${item.BoosterValue}`}
          isLoading={isBoosterLoading}
          isError={isBoosterError}
          onRetry={() => refetchBooster()}
          emptyTitle="No booster order history found"
        />
      )}
    </div>
  );
}
