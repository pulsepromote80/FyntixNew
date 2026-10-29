"use client";
import React, { useState } from "react";
import { roiWithdrawalService } from "@/spr-admin/features/roi-request/services/roiWithdrawal.service";
import { toast } from "sonner";
import {
  RotateCw,
  Search,
  Download,
  RotateCcw,
  Calendar,
  User,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Filter,
  Copy,
} from "lucide-react";

// ============================================================
// TYPES (Future API ready)
// ============================================================
interface ROIHistoryItem {
  sr: number;
  userId: string;
  name: string;
  email: string;
  amount: string;
  charges: string;
  release: string;
  walletAddress: string;
  transactionHash: string;
  createdDate: string;
  approvalDate: string;
  remark: string;
  status: "Approved" | "Rejected" | "Pending";
}

interface ROIStats {
  totalRequests: number;
  approved: number;
  rejected: number;
  totalAmount: string;
  totalRelease: string;
}

function formatBackendDate(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

// ============================================================
// COMPONENT
// ============================================================
export default function ROIHistory() {
  // ---- Filters ----
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  // ---- Data ----
  const [history, setHistory] = useState<ROIHistoryItem[]>([]);
  const [stats, setStats] = useState<ROIStats>({
    totalRequests: 0,
    approved: 0,
    rejected: 0,
    totalAmount: "$0",
    totalRelease: "$0",
  });
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- Pagination ----
  const [rowsPerPage, setRowsPerPage] = useState(500);
  const [currentPage, setCurrentPage] = useState(1);

  const getFilteredHistory = async (): Promise<ROIHistoryItem[]> => {
    const report = await roiWithdrawalService.getReport({
      authLogin: userId.trim(),
      fromDate: formatBackendDate(fromDate),
      toDate: formatBackendDate(toDate),
    });
    const normalizedUsername = username.trim().toLowerCase();

    return report.aprWithROI
      .filter(
        (record) =>
          (!normalizedUsername ||
            record.fullName.toLowerCase().includes(normalizedUsername)) &&
          (!status || record.status.toLowerCase() === status.toLowerCase()),
      )
      .map((record, index): ROIHistoryItem => ({
        sr: index + 1,
        userId: record.userId,
        name: record.fullName,
        email: record.email,
        amount: `$${record.amount.toFixed(2)}`,
        charges: `$${record.charges.toFixed(2)}`,
        release: `$${record.release.toFixed(2)}`,
        walletAddress: record.wallet || "-",
        transactionHash: record.transactionHash || "-",
        createdDate: record.createdDate || "-",
        approvalDate: record.approvalDate || "-",
        remark: record.remark || "-",
        status:
          record.status === "Rejected"
            ? "Rejected"
            : record.status === "Pending"
              ? "Pending"
              : "Approved",
      }));
  };

  // ============================================================
  // SEARCH HANDLER
  // ============================================================
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fromDate && toDate && fromDate > toDate) {
      setError("From Date cannot be later than To Date.");
      toast.error("From Date cannot be later than To Date.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getFilteredHistory();
      setHistory(data);
      const totalAmount = data.reduce(
        (total, item) => total + Number(item.amount.replace("$", "")),
        0,
      );
      const totalRelease = data.reduce(
        (total, item) => total + Number(item.release.replace("$", "")),
        0,
      );
      setStats({
        totalRequests: data.length,
        approved: data.filter((item) => item.status === "Approved").length,
        rejected: data.filter((item) => item.status === "Rejected").length,
        totalAmount: `$${totalAmount.toFixed(2)}`,
        totalRelease: `$${totalRelease.toFixed(2)}`,
      });
      setIsSearched(true);
      setCurrentPage(1);
      if (data.length === 0) toast.info("No ROI history records found.");
      else toast.success(`${data.length} ROI history record(s) found.`);
    } catch (fetchError) {
      console.error("Failed to fetch ROI history:", fetchError);
      setError("Unable to load ROI history. Please try again.");
      toast.error("Unable to load ROI history. Please try again.");
      setHistory([]);
      setIsSearched(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (fromDate && toDate && fromDate > toDate) {
      setError("From Date cannot be later than To Date.");
      toast.error("From Date cannot be later than To Date.");
      return;
    }

    let exportRows = history;
    if (!isSearched) {
      setIsLoading(true);
      setError("");
      try {
        exportRows = await getFilteredHistory();
        setHistory(exportRows);
        setIsSearched(true);
        setCurrentPage(1);
      } catch (fetchError) {
        console.error("Failed to fetch ROI history for export:", fetchError);
        setError("Unable to load ROI history. Please try again.");
        toast.error("Unable to load ROI history. Please try again.");
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (exportRows.length === 0) {
      toast.info("There are no ROI history records to export.");
      return;
    }

    const columns: (keyof ROIHistoryItem)[] = [
      "sr",
      "userId",
      "name",
      "email",
      "amount",
      "charges",
      "release",
      "walletAddress",
      "transactionHash",
      "createdDate",
      "approvalDate",
      "remark",
      "status",
    ];
    const csv = [
      columns.join(","),
      ...exportRows.map((item) =>
        columns
          .map((column) => `"${String(item[column]).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "roi-withdrawal-history.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${exportRows.length} ROI history record(s) exported successfully.`);
  };

  const handleRefresh = () => {
    setFromDate("");
    setToDate("");
    setUserId("");
    setUsername("");
    setStatus("");
    setHistory([]);
    setStats({
      totalRequests: 0,
      approved: 0,
      rejected: 0,
      totalAmount: "$0",
      totalRelease: "$0",
    });
    setError("");
    setIsSearched(false);
    setCurrentPage(1);
  };

  const handleCopy = (text: string) => {
    if (text && text !== "-") {
      void navigator.clipboard
        .writeText(text)
        .then(() => toast.success("Copied to clipboard!"))
        .catch((error: unknown) => {
          console.error("Failed to copy wallet address:", error);
          toast.error("Unable to copy wallet address.");
        });
    }
  };

  // ============================================================
  // PAGINATION
  // ============================================================
  const totalEntries = history.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentHistory = history.slice(startIndex, endIndex);

  return (
    <div className="flex w-full items-start justify-center px-4 pb-4 pt-1 font-sans text-gray-900 dark:text-gray-100">
      <div className="w-full flex flex-col gap-4">

        {/* ============ 1. Page Header ============ */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <RotateCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ROI History</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              View and manage all Mentor withdrawal requests
            </p>
          </div>
        </div>

        {/* ============ 2. Stat Cards (Only after search) ============ */}
        {isSearched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full animate-in fade-in slide-in-from-top-3 duration-300">

            {/* Total Requests */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#111318]">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Total Requests
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalRequests}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-500/15">
                <RotateCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Approved */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#111318]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Approved
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 dark:bg-green-500/15">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>

            {/* Rejected */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#111318]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Rejected
                </p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-100 dark:bg-red-500/15">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#111318]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Total Amount
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {stats.totalAmount}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-500/15">
                <DollarSign className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              </div>
            </div>

          </div>
        )}

        {/* ============ 3. Search Filters Card ============ */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#111318]">
          <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Search className="w-5 h-5" />
              Search Filters
            </h2>
            <p className="mt-1 text-xs text-white/90">
              Filter ROI history by date, user, or status
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch}>
              {/* Filter Grid - 5 columns on large */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">

                {/* From Date */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" /> From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" /> To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                  />
                </div>

                {/* User ID */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5 text-blue-600" /> User ID
                                  </label>
                                  <input
                                    type="text"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="Enter user ID"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                                  />
                                </div>

                {/* Username */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5 text-blue-600" /> Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <Filter className="h-3.5 w-3.5 text-blue-600" /> Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                    >
                      <option value="">All Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Pending">Pending</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  Export Excel
                </button>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="flex items-center gap-2 rounded-lg bg-slate-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {/* ============ 4. Results Table (Only after search) ============ */}
        {isSearched && (
          <div className="animate-in fade-in slide-in-from-top-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm duration-300 dark:border-gray-700 dark:bg-[#111318]">

            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-6 py-3 dark:border-blue-900/50 dark:bg-blue-950/30">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  Found {totalEntries} transactions
                </span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Total Amount: <span className="font-bold text-blue-700 dark:text-blue-300">{stats.totalAmount}</span>
                {" | "}
                    Total Release: <span className="font-bold text-green-700 dark:text-green-400">{stats.totalRelease}</span>
              </span>
            </div>

            {/* Table with horizontal scroll */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1600px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-700 dark:bg-[#191c23] dark:text-gray-300">
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">#</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">User ID</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Name</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Email</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Amount</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Charges</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Release</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Wallet Address</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Transaction Hash</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Created Date</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Approval Date</th>
                    <th className="border-r border-gray-200 px-3 py-3 dark:border-gray-700">Remark</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 dark:text-gray-300">
                  {currentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    currentHistory.map((item) => (
                      <tr
                        key={item.sr}
                        className="border-b border-gray-100 transition-colors hover:bg-blue-50/70 dark:border-gray-700 dark:hover:bg-blue-500/5"
                      >
                        <td className="border-r border-gray-100 px-3 py-4 font-medium dark:border-gray-700">{item.sr}</td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 dark:border-gray-700">{item.userId}</td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 font-medium text-gray-800 dark:border-gray-700 dark:text-gray-100">{item.name}</td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 dark:border-gray-700">{item.email}</td>
                        <td className="border-r border-gray-100 px-3 py-4 font-medium dark:border-gray-700">{item.amount}</td>
                        <td className="border-r border-gray-100 px-3 py-4 dark:border-gray-700">{item.charges}</td>
                        <td className="border-r border-gray-100 px-3 py-4 font-medium text-green-700 dark:border-gray-700 dark:text-green-400">{item.release}</td>

                        {/* Wallet Address with copy */}
                        <td className="border-r border-gray-100 px-3 py-4 dark:border-gray-700">
                          <div className="flex items-center gap-1.5">
                            <span className="whitespace-nowrap text-gray-600 dark:text-gray-300">{item.walletAddress}</span>
                            {item.walletAddress.trim() && item.walletAddress !== "-" && (
                              <button
                                onClick={() => handleCopy(item.walletAddress)}
                                className="shrink-0 text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Copy"
                                aria-label="Copy wallet address"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Transaction Hash with copy */}
                        <td className="border-r border-gray-100 px-3 py-4 dark:border-gray-700">
                          <div className="flex items-center gap-1.5">
                            <span className="whitespace-nowrap text-gray-600 dark:text-gray-300">{item.transactionHash}</span>
                            {item.transactionHash && item.transactionHash !== "-" && (
                              <button
                                onClick={() => handleCopy(item.transactionHash)}
                                className="shrink-0 text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Copy"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 dark:border-gray-700">{item.createdDate}</td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 dark:border-gray-700">{item.approvalDate}</td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 dark:border-gray-700">{item.remark}</td>

                        {/* Status */}
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              item.status === "Approved"
                                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
                                : item.status === "Rejected"
                                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                                : "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "Approved"
                                  ? "bg-green-500"
                                  : item.status === "Rejected"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                              }`}
                            ></span>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-3 dark:border-gray-700 dark:bg-[#111318] md:flex-row">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-300">
                Showing {totalEntries === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#1680ff] to-[#25c6e8] text-xs font-bold text-white">
                  {currentPage}
                </button>
                <button
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}