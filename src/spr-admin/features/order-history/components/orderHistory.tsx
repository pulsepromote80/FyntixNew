"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShoppingCart,
  Search,
  Download,
  RotateCcw,
  Calendar,
  User,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  getUserByAuthLogin,
  getOrderHistory,
  type OrderHistoryPayload,
  type OrderHistoryItem,
} from "../services/orderHistory.service";

// ============================================
// Debounce hook (inline)
// ============================================
function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

export default function OrderHistory() {
  // ---------- Filter state ----------
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");

  // ---------- Search trigger ----------
  const [searchPayload, setSearchPayload] = useState<OrderHistoryPayload>({
    AuthLogin: "",
    Statusid: "",
    FromDate: "",
    ToDate: "",
  });

  // ---------- Pagination ----------
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ---------- Debounce userId for username lookup ----------
  const debouncedUserId = useDebounce(userId, 500);

  // ============================================
  // 🔍 Username lookup (auto on userId change)
  // ============================================
  const userQuery = useQuery({
    queryKey: ["user-lookup", debouncedUserId],
    queryFn: () => getUserByAuthLogin(debouncedUserId.trim()),
    enabled: debouncedUserId.trim().length > 0,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // username update + toast
  useEffect(() => {
    if (!debouncedUserId.trim()) {
      setUsername("");
      return;
    }

    if (userQuery.isFetching) return;

    if (userQuery.error) {
      setUsername("");
      toast.error("User not found");
      return;
    }

    const user = userQuery.data?.data;
    if (user) {
      const fullName = `${user.FName ?? ""} ${user.LName ?? ""}`.trim();
      setUsername(fullName || "—");
    } else {
      setUsername("");
    }
  }, [debouncedUserId, userQuery.data, userQuery.isFetching, userQuery.error]);

  // ============================================
  // 🔍 Order History query
  // ============================================
  const ordersQuery = useQuery({
    queryKey: ["order-history", searchPayload],
    queryFn: () => getOrderHistory(searchPayload),
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  const orders: OrderHistoryItem[] = ordersQuery.data?.data ?? [];
  const totalEntries = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  // Total amount calc
  const totalAmount = orders.reduce((sum, o) => sum + (Number(o.LicenseAmount) || 0), 0);

  const isSearched = true;

  // ============================================
  // Handlers
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPayload({
      AuthLogin: userId.trim(),
      Statusid: "",
      FromDate: formatDate(fromDate),
      ToDate: formatDate(toDate),
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setFromDate("");
    setToDate("");
    setUserId("");
    setUsername("");
    setSearchPayload({
      AuthLogin: "",
      Statusid: "",
      FromDate: "",
      ToDate: "",
    });
    setCurrentPage(1);
    toast.success("Filters reset");
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // ============================================
  // Export to Excel (CSV)
  // ============================================
  const handleExport = () => {
    if (orders.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Sr",
      "Username",
      "Email",
      "Name",
      "Package",
      "Mobile",
      "License Amount",
      "License Date",
      "Topuped By",
      "Referral",
      "Position",
      "Duration (Months)",
      "Total Return",
      "Weekly Return",
    ];

    const rows = orders.map((o, i) => [
      i + 1,
      o.Loginid,
      o.Email,
      o.Name,
      o.PackageName,
      o.Mobile,
      o.LicenseAmount,
      o.LicenseDate,
      o.TopupedBy,
      o.Referralid,
      o.Position,
      o.DurationOnMonth,
      o.TotalReturn,
      o.WeeklyReturn,
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `order-history-${userId || "all"}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Exported successfully");
  };

  // ============================================
  // UI
  // ============================================
  return (
    <div className="flex w-full items-start justify-center bg-[#FAF6EC] px-4 pb-4 pt-1 font-sans">
      <div className="flex w-full flex-col gap-4">
        {/* ============ Header ============ */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-gray-900 shadow-sm">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
              <p className="mt-0.5 text-sm text-gray-500">View and manage all customer orders</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={orders.length === 0}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-[#B89328] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>

        {/* ============ Stat Cards ============ */}
        {isSearched && (
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Total Orders
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {ordersQuery.isFetching ? "—" : totalEntries}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-100">
                <ShoppingCart className="h-5 w-5 text-teal-600" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Total Amount
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  ${ordersQuery.isFetching ? "—" : totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* ============ Search Filters ============ */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[#D4AF37] px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Search className="h-5 w-5" />
              Search Filters
            </h2>
            <p className="mt-1 text-xs text-gray-800">Filter orders by date, product, or user</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch}>
              <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                {/* From Date */}
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" /> From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" /> To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* User ID — on change auto lookup */}
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <User className="h-3.5 w-3.5 text-[#D4AF37]" /> User ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter user ID"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    />
                    {userQuery.isFetching && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#D4AF37]" />
                    )}
                  </div>
                </div>

                {/* Username (auto-filled) */}
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <User className="h-3.5 w-3.5 text-[#D4AF37]" /> Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={username}
                    placeholder="Username will appear here"
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                <button
                  type="submit"
                  disabled={ordersQuery.isFetching}
                  className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-[#B89328] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {ordersQuery.isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {ordersQuery.isFetching ? "Searching..." : "Search Orders"}
                </button>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="flex items-center gap-2 rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Refresh Data
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ============ Results Table ============ */}
        {isSearched && (
          <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 bg-[#FFF9E6] px-6 py-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-sm font-bold text-gray-800">
                  Found {ordersQuery.isFetching ? "..." : totalEntries} orders
                </span>
              </div>
              <span className="text-xs text-gray-600">
                Total Amount:{" "}
                <span className="font-bold text-green-700">
                  ${ordersQuery.isFetching ? "..." : totalAmount.toFixed(2)}
                </span>
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {ordersQuery.isFetching ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                  <p className="text-sm text-gray-500">Loading order history...</p>
                </div>
              ) : ordersQuery.error ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16">
                  <p className="text-sm font-semibold text-red-500">Failed to load order history</p>
                  <p className="text-xs text-gray-500">
                    {(ordersQuery.error as { response?: { data?: { message?: string } } })?.response
                      ?.data?.message || "Something went wrong"}
                  </p>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16">
                  <ShoppingCart className="h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">No orders found</p>
                </div>
              ) : (
                <table className="w-full min-w-[1300px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#FAF6EC] text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      <th className="w-16 border-r border-gray-200 px-3 py-3 text-center">#</th>
                      <th className="border-r border-gray-200 px-3 py-3">Username</th>
                      <th className="border-r border-gray-200 px-3 py-3">Email</th>
                      <th className="border-r border-gray-200 px-3 py-3">Name</th>
                      <th className="border-r border-gray-200 px-3 py-3">Package</th>
                      <th className="border-r border-gray-200 px-3 py-3">Topuped By</th>
                      <th className="border-r border-gray-200 px-3 py-3 text-center">Price ($)</th>
                      <th className="border-r border-gray-200 px-3 py-3 text-center">
                        Duration (Months)
                      </th>
                      <th className="border-r border-gray-200 px-3 py-3 text-center">
                        Weekly APR ($)
                      </th>
                      <th className="border-r border-gray-200 px-3 py-3 text-center">
                        Total Return
                      </th>
                      <th className="border-r border-gray-200 px-3 py-3 text-center">Credit ($)</th>
                      <th className="px-3 py-3">Order Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700">
                    {currentOrders.map((item, idx) => (
                      <tr
                        key={`${item.Loginid}-${idx}`}
                        className="border-b border-gray-100 transition-colors hover:bg-[#FFF9E6]/40"
                      >
                        <td className="border-r border-gray-100 px-3 py-4 text-center font-medium">
                          {startIndex + idx + 1}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.Loginid}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.Email || "—"}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 font-medium text-gray-800">
                          {item.Name || "—"}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.PackageName || "—"}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.TopupedBy || "—"}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 text-center font-bold text-gray-800">
                          ${item.LicenseAmount}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 text-center">
                          {item.DurationOnMonth}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 text-center">
                          ${item.WeeklyReturn}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 text-center font-medium text-blue-700">
                          ${item.TotalReturn}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 text-center font-bold text-green-700">
                          ${item.WeeklyReturn}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">{item.LicenseDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Footer */}
            {!ordersQuery.isFetching && orders.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-3 md:flex-row">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="text-xs text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries}{" "}
                  entries
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPrev}
                    disabled={currentPage === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37] text-gray-900 transition hover:bg-[#B89328] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-bold text-gray-900">
                    {currentPage}
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37] text-gray-900 transition hover:bg-[#B89328] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
