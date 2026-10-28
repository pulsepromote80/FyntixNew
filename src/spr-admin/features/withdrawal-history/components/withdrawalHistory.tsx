"use client";

import React, { useState } from "react";
import { incomeRequestService } from "@/spr-admin/features/withdrawal-request/services/incomeRequest.service";
import { strToU8, zipSync } from "fflate";
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
interface WithdrawalHistoryItem {
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

interface WithdrawalStats {
  totalRequests: number;
  approved: number;
  rejected: number;
  totalAmount: string;
  totalRelease: string;
}

function xmlEscape(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function excelColumnName(index: number): string {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function downloadWithdrawalHistoryExcel(rows: WithdrawalHistoryItem[]) {
  const headers = [
    "No.",
    "User ID",
    "Name",
    "Email",
    "Amount",
    "Charges",
    "Release",
    "Wallet Address",
    "Transaction Hash",
    "Created Date",
    "Approval Date",
    "Remark",
    "Status",
  ];
  const values = rows.map((item, index) => [
    index + 1,
    item.userId,
    item.name,
    item.email,
    item.amount,
    item.charges,
    item.release,
    item.walletAddress,
    item.transactionHash,
    item.createdDate,
    item.approvalDate,
    item.remark,
    item.status,
  ]);
  const sheetRows = [headers, ...values]
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row
          .map((value, columnIndex) => {
            const reference = `${excelColumnName(columnIndex)}${rowIndex + 1}`;
            if (typeof value === "number") {
              return `<c r="${reference}" t="n"><v>${value}</v></c>`;
            }
            return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
          })
          .join("")}</row>`,
    )
    .join("");
  const files = {
    "[Content_Types].xml": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        "</Types>",
    ),
    "_rels/.rels": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        "</Relationships>",
    ),
    "xl/workbook.xml": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<sheets><sheet name="Withdrawal History" sheetId="1" r:id="rId1"/></sheets></workbook>',
    ),
    "xl/_rels/workbook.xml.rels": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        "</Relationships>",
    ),
    "xl/worksheets/sheet1.xml": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        `<sheetData>${sheetRows}</sheetData></worksheet>`,
    ),
  };
  const blob = new Blob([zipSync(files)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "withdrawal-history.xlsx";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============================================================
// COMPONENT
// ============================================================
export default function WithdrawalHistory() {
  // ---- Filters ----
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  // ---- Data ----
  const [history, setHistory] = useState<WithdrawalHistoryItem[]>([]);
  const [stats, setStats] = useState<WithdrawalStats>({
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

  const getFilteredHistory = async (): Promise<WithdrawalHistoryItem[]> => {
    const report = await incomeRequestService.getReport();
    return report.aprWithIncome
      .filter((request) => {
        const requestDate = request.createdDate.slice(0, 10);
        return (
          (!fromDate || requestDate >= fromDate) &&
          (!toDate || requestDate <= toDate) &&
          (!userId.trim() || request.userId.toLowerCase().includes(userId.trim().toLowerCase())) &&
          (!username.trim() ||
            request.fullName.toLowerCase().includes(username.trim().toLowerCase())) &&
          (!status || request.status.toLowerCase() === status.toLowerCase())
        );
      })
      .map((request, index): WithdrawalHistoryItem => ({
        sr: index + 1,
        userId: request.userId,
        name: request.fullName,
        email: request.email,
        amount: `$${request.totalWithdrawal.toFixed(2)}`,
        charges: `$${request.adminCharges.toFixed(2)}`,
        release: `$${request.release.toFixed(2)}`,
        walletAddress: request.wallet || "-",
        transactionHash: request.transactionHash || "-",
        createdDate: request.createdDate || "-",
        approvalDate: request.approvalDate || "-",
        remark: request.remark || "-",
        status:
          request.status === "Rejected"
            ? "Rejected"
            : request.status === "Pending"
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
      const filtered = await getFilteredHistory();
      setHistory(filtered);
      const totalAmount = filtered.reduce(
        (total, request) => total + Number(request.amount.replace("$", "")),
        0,
      );
      const totalRelease = filtered.reduce(
        (total, request) => total + Number(request.release.replace("$", "")),
        0,
      );
      setStats({
        totalRequests: filtered.length,
        approved: filtered.filter((request) => request.status === "Approved").length,
        rejected: filtered.filter((request) => request.status === "Rejected").length,
        totalAmount: `$${totalAmount.toFixed(2)}`,
        totalRelease: `$${totalRelease.toFixed(2)}`,
      });
      setIsSearched(true);
      setCurrentPage(1);
      if (filtered.length === 0) toast.info("No withdrawal history records found.");
      else toast.success(`${filtered.length} withdrawal history record(s) found.`);
    } catch (fetchError) {
      console.error("Failed to fetch withdrawal history:", fetchError);
      setError("Unable to load withdrawal history. Please try again.");
      toast.error("Unable to load withdrawal history. Please try again.");
      setHistory([]);
      setStats({
        totalRequests: 0,
        approved: 0,
        rejected: 0,
        totalAmount: "$0",
        totalRelease: "$0",
      });
      setIsSearched(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (fromDate && toDate && fromDate > toDate) {
      setError("From Date cannot be later than To Date.");
      return;
    }

    let rows = history;
    if (!isSearched) {
      setIsLoading(true);
      setError("");
      try {
        rows = await getFilteredHistory();
        setHistory(rows);
        setIsSearched(true);
        setCurrentPage(1);
      } catch (fetchError) {
        console.error("Failed to fetch withdrawal history for export:", fetchError);
        setError("Unable to load withdrawal history. Please try again.");
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (rows.length === 0) {
      alert("There are no withdrawal history records to export.");
      return;
    }

    downloadWithdrawalHistoryExcel(rows);
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
    <div className="spr-admin-withdrawal-history flex w-full items-start justify-center px-4 pb-4 pt-1 font-sans">
      <div className="flex w-full flex-col gap-4">
        {/* ============ 1. Page Header ============ */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <RotateCw className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Withdrawal History</h1>
            <p className="mt-0.5 text-sm text-gray-500">View and manage all withdrawal requests</p>
          </div>
        </div>

        {/* ============ 2. Stat Cards (Only after search) ============ */}
        {isSearched && (
          <div className="animate-in fade-in slide-in-from-top-3 grid w-full grid-cols-1 gap-4 duration-300 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Requests */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Total Requests
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-100">
                <RotateCw className="h-5 w-5 text-teal-600" />
              </div>
            </div>

            {/* Approved */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Approved</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>

            {/* Rejected */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Rejected</p>
                <p className="mt-1 text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Total Amount
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-700">{stats.totalAmount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </div>
        )}

        {/* ============ 3. Search Filters Card ============ */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Search className="h-5 w-5" />
              Search Filters
            </h2>
            <p className="mt-1 text-xs text-white/90">
              Filter withdrawal history by date, user, or status
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch}>
              {/* Filter Grid - 5 columns on large */}
              <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
                {/* From Date */}
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" /> From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" /> To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* User ID */}
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <User className="h-3.5 w-3.5 text-blue-600" /> User ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <User className="h-3.5 w-3.5 text-blue-600" /> Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <Filter className="h-3.5 w-3.5 text-blue-600" /> Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Pending">Pending</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </button>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="flex items-center gap-2 rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* ============ 4. Results Table ============ */}
        {isSearched && (
          <div className="animate-in fade-in slide-in-from-top-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm duration-300">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-6 py-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-gray-800">
                  Found {totalEntries} transactions
                </span>
              </div>
              <span className="text-xs text-gray-600">
                Total Amount: <span className="font-bold text-blue-700">{stats.totalAmount}</span>
                {" | "}
                Total Release:{" "}
                <span className="font-bold text-green-700">{stats.totalRelease}</span>
              </span>
            </div>

            {/* Table with horizontal scroll */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1600px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    <th className="border-r border-gray-200 px-3 py-3">#</th>
                    <th className="border-r border-gray-200 px-3 py-3">User ID</th>
                    <th className="border-r border-gray-200 px-3 py-3">Name</th>
                    <th className="border-r border-gray-200 px-3 py-3">Email</th>
                    <th className="border-r border-gray-200 px-3 py-3">Amount</th>
                    <th className="border-r border-gray-200 px-3 py-3">Charges</th>
                    <th className="border-r border-gray-200 px-3 py-3">Release</th>
                    <th className="border-r border-gray-200 px-3 py-3">Wallet Address</th>
                    <th className="border-r border-gray-200 px-3 py-3">Transaction Hash</th>
                    <th className="border-r border-gray-200 px-3 py-3">Created Date</th>
                    <th className="border-r border-gray-200 px-3 py-3">Approval Date</th>
                    <th className="border-r border-gray-200 px-3 py-3">Remark</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700">
                  {currentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-3 py-8 text-center text-gray-500">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    currentHistory.map((item) => (
                      <tr
                        key={item.sr}
                        className="border-b border-gray-100 transition-colors hover:bg-blue-50/50"
                      >
                        <td className="border-r border-gray-100 px-3 py-4 font-medium">
                          {item.sr}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.userId}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 font-medium text-gray-800">
                          {item.name}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.email}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 font-medium">
                          {item.amount}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4">{item.charges}</td>
                        <td className="border-r border-gray-100 px-3 py-4 font-medium text-green-700">
                          {item.release}
                        </td>

                        {/* Wallet Address with copy icon */}
                        <td className="border-r border-gray-100 px-3 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="whitespace-nowrap text-gray-600">
                              {item.walletAddress}
                            </span>
                            {item.walletAddress.trim() && item.walletAddress !== "-" && (
                              <button
                                onClick={() => handleCopy(item.walletAddress)}
                                className="shrink-0 text-green-600 transition hover:text-green-700"
                                title="Copy"
                                aria-label="Copy wallet address"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Transaction Hash with copy icon */}
                        <td className="border-r border-gray-100 px-3 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="whitespace-nowrap text-gray-600">
                              {item.transactionHash}
                            </span>
                            {item.transactionHash && item.transactionHash !== "-" && (
                              <button
                                onClick={() => handleCopy(item.transactionHash)}
                                className="shrink-0 text-green-600 transition hover:text-green-700"
                                title="Copy"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.createdDate}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.approvalDate}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.remark}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              item.status === "Approved"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : item.status === "Rejected"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-yellow-200 bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
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
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-3 md:flex-row">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
              </div>

              <div className="text-xs text-gray-600">
                Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(endIndex, totalEntries)} of {totalEntries} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {currentPage}
                </button>
                <button
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
