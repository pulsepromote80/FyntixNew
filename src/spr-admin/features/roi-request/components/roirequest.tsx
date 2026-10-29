"use client";

import React, { useState } from "react";
import { roiWithdrawalService, type ROIWithdrawalRecord } from "../services/roiWithdrawal.service";
import { WalletConnectionCard } from "@/spr-admin/features/wallet/components/WalletConnectionCard";
import { useBscUsdtWallet } from "@/spr-admin/features/wallet/hooks/useBscUsdtWallet";
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
  Copy,
  X,
} from "lucide-react";

// ============================================================
// TYPES (Future API ready)
// ============================================================
interface ROIWithdrawalRequest {
  id: string;
  requestId: number | null;
  sr: number;
  userId: string;
  name: string;
  date: string;
  request: string;
  charges: string;
  release: string;
  email: string;
  walletAddress: string;
  status: "Pending" | "Approved" | "Rejected";
  remark: string;
}

interface ROIStats {
  totalRequests: number;
  totalRelease: string;
}

function formatBackendDate(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function mapRequest(record: ROIWithdrawalRecord, index: number): ROIWithdrawalRequest {
  return {
    id: record.id,
    requestId: record.requestId,
    sr: index + 1,
    userId: record.userId,
    name: record.fullName,
    date: record.createdDate ? (record.createdDate.split("T")[0] ?? "-") : "-",
    request: `$${record.amount.toFixed(2)}`,
    charges: `$${record.charges.toFixed(2)}`,
    release: `$${record.release.toFixed(2)}`,
    email: record.email,
    walletAddress: record.wallet || "-",
    status:
      record.status === "Approved" || record.status === "Rejected" ? record.status : "Pending",
    remark: record.remark || "-",
  };
}

// ============================================================
// COMPONENT
// ============================================================
export default function ROIWithdrawalRequests() {
  const { account, chainId, sendUsdt } = useBscUsdtWallet();
  // ---- Filters ----
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");

  // ---- Data ----
  const [requests, setRequests] = useState<ROIWithdrawalRequest[]>([]);
  const [stats, setStats] = useState<ROIStats>({
    totalRequests: 0,
    totalRelease: "$0",
  });
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- Pagination ----
  const [rowsPerPage, setRowsPerPage] = useState(500);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ROIWithdrawalRequest | null>(null);
  const [activeStatusAction, setActiveStatusAction] = useState<"approve" | "reject" | null>(null);
  const [statusRemark, setStatusRemark] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [usdtProcessingId, setUsdtProcessingId] = useState("");
  const [unrecordedTransfers, setUnrecordedTransfers] = useState<Map<string, string>>(new Map());

  const getFilteredRequests = async (): Promise<ROIWithdrawalRequest[]> => {
    const report = await roiWithdrawalService.getReport({
      authLogin: userId.trim(),
      fromDate: formatBackendDate(fromDate),
      toDate: formatBackendDate(toDate),
    });
    const normalizedUsername = username.trim().toLowerCase();

    return report.unApWithROI
      .filter(
        (record) =>
          !normalizedUsername || record.fullName.toLowerCase().includes(normalizedUsername),
      )
      .map(mapRequest);
  };

  const refreshRequests = async () => {
    const updatedRequests = await getFilteredRequests();
    setRequests(updatedRequests);
    setStats({
      totalRequests: updatedRequests.length,
      totalRelease: `$${updatedRequests
        .reduce((total, request) => total + Number(request.release.replace("$", "")), 0)
        .toFixed(2)}`,
    });
    setCurrentPage((page) =>
      Math.min(page, Math.max(1, Math.ceil(updatedRequests.length / rowsPerPage))),
    );
  };

  const openStatusConfirmation = (request: ROIWithdrawalRequest, action: "approve" | "reject") => {
    if (!request.requestId) {
      toast.error("This ROI request is missing the ID required to update its status.");
      return;
    }
    setSelectedRequest(request);
    setStatusRemark(action === "approve" ? "Approved by admin" : "");
    setActiveStatusAction(action);
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !activeStatusAction || !selectedRequest.requestId) return;
    if (!statusRemark.trim()) {
      toast.error(`Enter a ${activeStatusAction} remark to continue.`);
      return;
    }

    const action = activeStatusAction;
    setIsUpdatingStatus(true);
    try {
      const response = await roiWithdrawalService.approveOrReject({
        action,
        id: selectedRequest.requestId,
        authLoginId: selectedRequest.userId,
        rfstatus: action === "approve" ? 1 : 2,
        remark: statusRemark.trim(),
      });
      if (response.statusCode !== 1 && response.statusCode !== 200) {
        throw new Error(response.message || `Failed to ${action} ROI request.`);
      }

      toast.success(
        response.message || `${action === "approve" ? "Approved" : "Rejected"} Successfully!`,
      );
      setRequests((current) => current.filter((request) => request.id !== selectedRequest.id));
      setSelectedRequest(null);
      setActiveStatusAction(null);
      setStatusRemark("");
      try {
        await refreshRequests();
      } catch (refreshError) {
        console.error("ROI status updated but request list refresh failed:", refreshError);
        toast.error("Action completed, but ROI requests could not be refreshed.");
      }
    } catch (actionError) {
      console.error(`Failed to ${action} ROI withdrawal request:`, actionError);
      toast.error(
        actionError instanceof Error
          ? actionError.message
          : `Unable to ${action} ROI withdrawal request.`,
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUsdtApprove = async (request: ROIWithdrawalRequest) => {
    const releaseAmount = Number(request.release.replace("$", ""));
    if (
      !request.userId ||
      !request.walletAddress ||
      request.walletAddress === "-" ||
      releaseAmount <= 0
    ) {
      toast.error("ROI withdrawal details are incomplete or invalid.");
      return;
    }

    let transactionHash = unrecordedTransfers.get(request.id);
    if (!transactionHash && !account) {
      toast.error("Connect MetaMask before approving a USDT withdrawal.");
      return;
    }
    if (!transactionHash && chainId.toLowerCase() !== "0x38") {
      toast.error("Switch MetaMask to BNB Smart Chain before approving USDT.");
      return;
    }

    setUsdtProcessingId(request.id);
    try {
      if (!transactionHash) {
        toast.info("Confirm the USDT transfer in MetaMask.");
        const sentTransactionHash = await sendUsdt(request.walletAddress, releaseAmount);
        transactionHash = sentTransactionHash;
        setUnrecordedTransfers((current) => new Map(current).set(request.id, sentTransactionHash));
      }
      if (!transactionHash) throw new Error("The USDT transaction hash is missing.");

      const response = await roiWithdrawalService.recordUsdtTransfer({
        authLoginId: request.userId,
        debit: releaseAmount,
        wallet: request.walletAddress,
        transHash: transactionHash,
      });
      if (response.statusCode !== 1 && response.statusCode !== 200) {
        throw new Error(response.message || "USDT transfer was sent but could not be recorded.");
      }

      setUnrecordedTransfers((current) => {
        const next = new Map(current);
        next.delete(request.id);
        return next;
      });
      setRequests((current) => current.filter((row) => row.id !== request.id));
      toast.success(response.message || "USDT Transaction Approved Successfully!");
      try {
        await refreshRequests();
      } catch (refreshError) {
        console.error("USDT approval succeeded but ROI request refresh failed:", refreshError);
        toast.error("USDT approval completed, but ROI requests could not be refreshed.");
      }
    } catch (actionError) {
      console.error("Failed to complete ROI USDT approval:", actionError);
      if (transactionHash) {
        toast.error(
          `USDT was sent, but approval could not be recorded. Retry Record this request. Tx: ${transactionHash}`,
        );
      } else {
        const code =
          typeof actionError === "object" && actionError !== null && "code" in actionError
            ? actionError.code
            : undefined;
        toast.error(
          code === 4001
            ? "USDT transaction was rejected in MetaMask."
            : actionError instanceof Error
              ? actionError.message
              : "Unable to approve ROI withdrawal with USDT.",
        );
      }
    } finally {
      setUsdtProcessingId("");
    }
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
      const data = await getFilteredRequests();
      const fetchedStats: ROIStats = {
        totalRequests: data.length,
        totalRelease: `$${data
          .reduce((total, request) => total + Number(request.release.replace("$", "")), 0)
          .toFixed(2)}`,
      };
      setRequests(data);
      setStats(fetchedStats);
      setIsSearched(true);
      setCurrentPage(1);
      if (data.length === 0) toast.info("No Mentor withdrawal requests found.");
      else toast.success(`${data.length} Mentor withdrawal request(s) found.`);
    } catch (fetchError) {
      console.error("Failed to fetch Mentor withdrawal requests:", fetchError);
      setError("Unable to load Mentor withdrawal requests. Please try again.");
      toast.error("Unable to load Mentor withdrawal requests. Please try again.");
      setRequests([]);
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

    let exportRows = requests;
    if (!isSearched) {
      setIsLoading(true);
      setError("");
      try {
        exportRows = await getFilteredRequests();
        setRequests(exportRows);
        setStats({
          totalRequests: exportRows.length,
          totalRelease: `$${exportRows
            .reduce((total, request) => total + Number(request.release.replace("$", "")), 0)
            .toFixed(2)}`,
        });
        setIsSearched(true);
        setCurrentPage(1);
      } catch (fetchError) {
        console.error("Failed to fetch Mentor requests for export:", fetchError);
        setError("Unable to load Mentor withdrawal requests. Please try again.");
        toast.error("Unable to load Mentor withdrawal requests. Please try again.");
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (exportRows.length === 0) {
      toast.info("There are no ROI requests to export.");
      return;
    }

    const columns: (keyof ROIWithdrawalRequest)[] = [
      "sr",
      "userId",
      "name",
      "date",
      "request",
      "charges",
      "release",
      "email",
      "walletAddress",
      "status",
      "remark",
    ];
    const csv = [
      columns.join(","),
      ...exportRows.map((request) =>
        columns.map((column) => `"${String(request[column]).replaceAll('"', '""')}"`).join(","),
      ),
    ].join("\n");
    const downloadUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "roi-withdrawal-requests.csv";
    link.click();
    URL.revokeObjectURL(downloadUrl);
    toast.success(`${exportRows.length} ROI request(s) exported successfully.`);
  };

  const handleRefresh = () => {
    setFromDate("");
    setToDate("");
    setUserId("");
    setUsername("");
    setRequests([]);
    setError("");
    setStats({ totalRequests: 0, totalRelease: "$0" });
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
          toast.error("Unable to copy Wallet Address.");
        });
    }
  };

  // ============================================================
  // PAGINATION
  // ============================================================
  const totalEntries = requests.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  return (
    <div className="spr-admin-roi-withdrawal flex w-full items-start justify-center px-4 pb-4 pt-1 font-sans">
      <div className="flex w-full flex-col gap-4">
        {/* ============ 1. Page Header ============ */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <RotateCw className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentor Withdrawal Requests</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Manage and process Mentor withdrawal requests
            </p>
          </div>
        </div>

        {/* ============ 2. Wallet Connection ============ */}
        <WalletConnectionCard />

        {/* ============ 3. Stat Cards (Only after search) ============ */}
        {isSearched && (
          <div className="animate-in fade-in slide-in-from-top-3 grid w-full grid-cols-1 gap-4 duration-300 md:grid-cols-2">
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

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Total Release Amount
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600">{stats.totalRelease}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* ============ 4. Search Filters Card ============ */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Search className="h-5 w-5" />
              Search Filters
            </h2>
            <p className="mt-1 text-xs text-white/90">
              Filter Mentor withdrawal requests by date or user
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch}>
              <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
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
                  Export
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

        {/* ============ 5. Results Table ============ */}
        {isSearched && (
          <div className="animate-in fade-in slide-in-from-top-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm duration-300">
            <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-6 py-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-gray-800">
                  Found {totalEntries} pending ROI requests
                </span>
              </div>
              <span className="text-xs text-gray-600">
                Total Pending Release:{" "}
                <span className="font-bold text-green-700">{stats.totalRelease}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    <th className="border-r border-gray-200 px-3 py-3">#</th>
                    <th className="border-r border-gray-200 px-3 py-3">USDT Action</th>
                    <th className="border-r border-gray-200 px-3 py-3">Action</th>
                    <th className="border-r border-gray-200 px-3 py-3">User ID</th>
                    <th className="border-r border-gray-200 px-3 py-3">Name</th>
                    <th className="border-r border-gray-200 px-3 py-3">Date</th>
                    <th className="border-r border-gray-200 px-3 py-3">Request ($)</th>
                    <th className="border-r border-gray-200 px-3 py-3">Charges ($)</th>
                    <th className="border-r border-gray-200 px-3 py-3">Release ($)</th>
                    <th className="border-r border-gray-200 px-3 py-3">Email</th>
                    <th className="border-r border-gray-200 px-3 py-3">Wallet Address</th>
                    <th className="border-r border-gray-200 px-3 py-3">Status</th>
                    <th className="border-r border-gray-200 px-3 py-3">Remark</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700">
                  {currentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-3 py-8 text-center text-gray-500">
                        No Mentor withdrawal requests found.
                      </td>
                    </tr>
                  ) : (
                    currentRequests.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 transition-colors hover:bg-blue-50/50"
                      >
                        <td className="border-r border-gray-100 px-3 py-4 font-medium">
                          {item.sr}
                        </td>

                        {/* USDT Action */}
                        <td className="border-r border-gray-100 px-3 py-4">
                          <button
                            type="button"
                            onClick={() => void handleUsdtApprove(item)}
                            disabled={
                              usdtProcessingId === item.id ||
                              (!unrecordedTransfers.has(item.id) &&
                                (!account || chainId.toLowerCase() !== "0x38"))
                            }
                            title={
                              unrecordedTransfers.has(item.id)
                                ? "Retry recording the existing USDT transfer"
                                : !account
                                  ? "Connect MetaMask first"
                                  : chainId.toLowerCase() !== "0x38"
                                    ? "Switch to BNB Smart Chain"
                                    : "Send the release amount to the user's wallet"
                            }
                            className="whitespace-nowrap rounded-full bg-green-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {usdtProcessingId === item.id
                              ? "Processing..."
                              : unrecordedTransfers.has(item.id)
                                ? "Retry Record"
                                : "Approve USDT"}
                          </button>
                        </td>

                        {/* Manual approval */}
                        <td className="border-r border-gray-100 px-3 py-4">
                          <button
                            type="button"
                            onClick={() => openStatusConfirmation(item, "approve")}
                            disabled={!item.requestId || isUpdatingStatus}
                            className="rounded-full bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Approve
                          </button>
                        </td>

                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.userId}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 font-medium text-gray-800">
                          {item.name}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.date}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 font-medium">
                          {item.request}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4">{item.charges}</td>
                        <td className="border-r border-gray-100 px-3 py-4 font-medium text-green-700">
                          {item.release}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.email}
                        </td>

                        {/* Wallet Address with copy */}
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

                        {/* Status */}
                        <td className="border-r border-gray-100 px-3 py-4">
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

                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 text-gray-600">
                          {item.remark}
                        </td>

                        {/* Reject Action */}
                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() => openStatusConfirmation(item, "reject")}
                            disabled={!item.requestId || isUpdatingStatus}
                            className="rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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

              {selectedRequest && activeStatusAction && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
                  <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="roi-withdrawal-action-title"
                    className="w-full max-w-md rounded-xl border border-blue-200 bg-white p-5 shadow-2xl"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h2
                          id="roi-withdrawal-action-title"
                          className="text-lg font-bold text-gray-900"
                        >
                          {activeStatusAction === "approve"
                            ? "Approve ROI withdrawal"
                            : "Reject ROI withdrawal"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                          {selectedRequest.userId} · {selectedRequest.request}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Close confirmation"
                        disabled={isUpdatingStatus}
                        onClick={() => {
                          setSelectedRequest(null);
                          setActiveStatusAction(null);
                        }}
                        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {activeStatusAction === "approve" ? (
                      <p className="text-sm text-gray-700">
                        This will approve the request with the remark “Approved by admin”.
                      </p>
                    ) : (
                      <>
                        <label
                          htmlFor="roi-withdrawal-rejection-remark"
                          className="mb-1.5 block text-sm font-semibold text-gray-700"
                        >
                          Rejection reason
                        </label>
                        <textarea
                          id="roi-withdrawal-rejection-remark"
                          value={statusRemark}
                          onChange={(event) => setStatusRemark(event.target.value)}
                          placeholder="Enter rejection reason..."
                          rows={3}
                          maxLength={500}
                          className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                      </>
                    )}
                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => {
                          setSelectedRequest(null);
                          setActiveStatusAction(null);
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleStatusUpdate()}
                        disabled={
                          isUpdatingStatus ||
                          (activeStatusAction === "reject" && !statusRemark.trim())
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          activeStatusAction === "approve"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {isUpdatingStatus
                          ? "Saving..."
                          : activeStatusAction === "approve"
                            ? "Confirm Approve"
                            : "Confirm Reject"}
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
