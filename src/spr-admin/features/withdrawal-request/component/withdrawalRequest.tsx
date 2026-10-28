"use client";

import React, { useState } from "react";
import { incomeRequestService, type IncomeRequest } from "../services/incomeRequest.service";
import { WalletConnectionCard } from "@/spr-admin/features/wallet/components/WalletConnectionCard";
import { useBscUsdtWallet } from "@/spr-admin/features/wallet/hooks/useBscUsdtWallet";
import { toast } from "sonner";
import { isAxiosError } from "axios";
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
  X,
  Copy,
} from "lucide-react";

function getWithdrawalActionErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default function WithdrawalRequests() {
  const { account, chainId, sendUsdt } = useBscUsdtWallet();
  // Search filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [requests, setRequests] = useState<IncomeRequest[]>([]);

  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(500);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<IncomeRequest | null>(null);
  const [activeStatusAction, setActiveStatusAction] = useState<"approve" | "reject" | null>(null);
  const [statusRemark, setStatusRemark] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [usdtProcessingId, setUsdtProcessingId] = useState("");
  const [unrecordedTransfers, setUnrecordedTransfers] = useState<Map<string, string>>(new Map());

  const getFilteredRequests = async () => {
    const report = await incomeRequestService.getReport();
    return report.unApWithIncome.filter((request) => {
      const requestDate = request.createdDate.slice(0, 10);
      return (
        (!fromDate || requestDate >= fromDate) &&
        (!toDate || requestDate <= toDate) &&
        (!userId.trim() || request.userId.toLowerCase().includes(userId.trim().toLowerCase())) &&
        (!username.trim() || request.fullName.toLowerCase().includes(username.trim().toLowerCase()))
      );
    });
  };

  const refreshRequests = async () => {
    const filteredRequests = await getFilteredRequests();
    setRequests(filteredRequests);
    setCurrentPage(1);
  };

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
      const filteredRequests = await getFilteredRequests();
      setRequests(filteredRequests);
      setIsSearched(true);
      if (filteredRequests.length === 0) toast.info("No withdrawal requests found.");
      else toast.success(`${filteredRequests.length} withdrawal request(s) found.`);
    } catch (fetchError) {
      console.error("Failed to fetch withdrawal requests:", fetchError);
      setError("Unable to load withdrawal requests. Please try again.");
      toast.error("Unable to load withdrawal requests. Please try again.");
      setRequests([]);
      setIsSearched(false);
    } finally {
      setIsLoading(false);
    }
    setCurrentPage(1);
  };

  const handleExport = async () => {
    if (fromDate && toDate && fromDate > toDate) {
      setError("From Date cannot be later than To Date.");
      toast.error("From Date cannot be later than To Date.");
      return;
    }

    let exportRequests = requests;

    if (exportRequests.length === 0 && !isSearched) {
      setIsLoading(true);
      setError("");
      try {
        const report = await incomeRequestService.getReport();
        exportRequests = report.unApWithIncome.filter((request) => {
          const requestDate = request.createdDate.slice(0, 10);
          return (
            (!fromDate || requestDate >= fromDate) &&
            (!toDate || requestDate <= toDate) &&
            (!userId.trim() ||
              request.userId.toLowerCase().includes(userId.trim().toLowerCase())) &&
            (!username.trim() ||
              request.fullName.toLowerCase().includes(username.trim().toLowerCase()))
          );
        });
        setRequests(exportRequests);
        setIsSearched(true);
        setCurrentPage(1);
      } catch (fetchError) {
        console.error("Failed to fetch withdrawal requests for export:", fetchError);
        setError("Unable to load withdrawal requests. Please try again.");
        toast.error("Unable to load withdrawal requests. Please try again.");
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (exportRequests.length === 0) {
      toast.info("There are no withdrawal requests to export.");
      return;
    }

    const columns = [
      "User ID",
      "Name",
      "Date",
      "Request",
      "Charges",
      "Release",
      "Email",
      "Wallet",
      "Status",
      "Remark",
    ];
    const rows = exportRequests.map((request) => [
      request.userId,
      request.fullName,
      request.createdDate,
      request.totalWithdrawal,
      request.adminCharges,
      request.release,
      request.email,
      request.wallet,
      request.status,
      request.remark,
    ]);
    const csv = [columns, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "withdrawal-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${exportRequests.length} withdrawal request(s) exported successfully.`);
  };

  const handleRefresh = () => {
    setFromDate("");
    setToDate("");
    setUserId("");
    setUsername("");
    setRequests([]);
    setError("");
    setIsSearched(false);
    setCurrentPage(1);
    setSelectedRequest(null);
    setActiveStatusAction(null);
    setStatusRemark("");
  };

  const handleCopyWallet = async (wallet: string) => {
    try {
      await navigator.clipboard.writeText(wallet);
      toast.success("Copied to clipboard!");
    } catch (copyError) {
      console.error("Failed to copy wallet address:", copyError);
      toast.error("Unable to copy wallet address.");
    }
  };

  const openStatusConfirmation = (request: IncomeRequest, action: "approve" | "reject") => {
    if (!request.requestId) {
      toast.error("This request is missing the ID required to update its status.");
      return;
    }
    setSelectedRequest(request);
    setStatusRemark("");
    setActiveStatusAction(action);
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !activeStatusAction) return;
    if (!selectedRequest.requestId) {
      toast.error("This request is missing its request ID.");
      return;
    }
    if (!statusRemark.trim()) {
      toast.error(`Enter a ${activeStatusAction} remark to continue.`);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const actionName = activeStatusAction;
      const response = await incomeRequestService.approveOrReject({
        action: actionName,
        id: selectedRequest.requestId,
        authLoginId: selectedRequest.userId,
        rfstatus: actionName === "approve" ? 1 : 2,
        remark: statusRemark.trim(),
      });
      if (response.statusCode !== 1 && response.statusCode !== 200) {
        throw new Error(response.message || `${actionName} failed.`);
      }

      toast.success(
        response.message ||
          `Withdrawal request ${actionName === "approve" ? "approved" : "rejected"}.`,
      );
      setRequests((current) => current.filter((request) => request.id !== selectedRequest.id));
      setSelectedRequest(null);
      setActiveStatusAction(null);
      setStatusRemark("");
      try {
        await refreshRequests();
      } catch (refreshError) {
        console.error("Withdrawal status updated but request list refresh failed:", refreshError);
        toast.error("Action completed, but the request list could not be refreshed.");
      }
    } catch (actionError) {
      console.error(`Failed to ${activeStatusAction} withdrawal request:`, actionError);
      toast.error(
        getWithdrawalActionErrorMessage(
          actionError,
          `Unable to ${activeStatusAction} withdrawal request.`,
        ),
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUsdtApprove = async (request: IncomeRequest) => {
    if (!request.userId || !request.wallet || request.release <= 0 || request.debit <= 0) {
      toast.error("Withdrawal details are incomplete or invalid.");
      return;
    }
    let txHash = unrecordedTransfers.get(request.id);
    if (!txHash && !account) {
      toast.error("Connect MetaMask before approving a USDT withdrawal.");
      return;
    }
    if (!txHash && chainId.toLowerCase() !== "0x38") {
      toast.error("Switch MetaMask to BNB Smart Chain before approving USDT.");
      return;
    }

    setUsdtProcessingId(request.id);
    try {
      if (!txHash) {
        toast.info("Confirm the USDT transfer in MetaMask.");
        const sentTransactionHash = await sendUsdt(request.wallet, request.release);
        txHash = sentTransactionHash;
        setUnrecordedTransfers((current) => new Map(current).set(request.id, sentTransactionHash));
      }
      if (!txHash) throw new Error("The USDT transaction hash is missing.");

      const response = await incomeRequestService.recordUsdtTransfer({
        AuthLoginId: request.userId,
        debit: request.release,
        Wallet: request.wallet,
        TransHash: txHash,
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
      toast.success(response.message || "USDT transfer approved successfully.");
      try {
        await refreshRequests();
      } catch (refreshError) {
        console.error("USDT approval succeeded but request list refresh failed:", refreshError);
        toast.error("USDT approval completed, but the request list could not be refreshed.");
      }
    } catch (actionError) {
      console.error("Failed to complete USDT withdrawal approval:", actionError);
      if (txHash) {
        const reason = getWithdrawalActionErrorMessage(
          actionError,
          "The backend did not confirm the approval.",
        );
        toast.error(
          `USDT was sent, but approval could not be recorded: ${reason} Use Retry Record for this request. Tx: ${txHash}`,
        );
      } else {
        const code =
          typeof actionError === "object" && actionError !== null && "code" in actionError
            ? actionError.code
            : undefined;
        toast.error(
          code === 4001
            ? "USDT transaction was rejected in MetaMask."
            : getWithdrawalActionErrorMessage(actionError, "Unable to approve USDT withdrawal."),
        );
      }
    } finally {
      setUsdtProcessingId("");
    }
  };

  const totalPages = Math.ceil(requests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  const totalRequests = requests.length;
  const totalRelease = `$${requests.reduce((total, request) => total + request.release, 0).toFixed(2)}`;

  return (
    <div className="spr-admin-withdrawal-requests flex w-full items-start justify-center px-4 pb-4 pt-1 font-sans">
      <div className="flex w-full flex-col gap-4">
        {/* ============ 1. Page Header ============ */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <RotateCw className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
            <p className="mt-0.5 text-sm text-gray-500">Manage and process withdrawal requests</p>
          </div>
        </div>

        {/* ============ 2. Wallet Connection ============ */}
        <WalletConnectionCard />

        {/* ============ 3. Stat Cards (Only after search) ============ */}
        {isSearched && (
          <div className="animate-in fade-in slide-in-from-top-3 grid w-full grid-cols-1 gap-4 duration-300 md:grid-cols-2">
            {/* Total Requests */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Total Requests
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalRequests}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-100">
                <RotateCw className="h-5 w-5 text-teal-600" />
              </div>
            </div>

            {/* Total Release Amount */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Total Release Amount
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600">{totalRelease}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* ============ 4. Search Filters Card ============ */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Card Header - KALKII Gold */}
          <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Search className="h-5 w-5" />
              Search Filters
            </h2>
            <p className="mt-1 text-xs text-white/90">Filter withdrawal requests by date or user</p>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <form onSubmit={handleSearch}>
              {/* Filter Grid - 4 columns */}
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
                    placeholder="Username will appear here"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 shrink-0" />
                  )}
                  <span>{isLoading ? "Loading..." : "Search"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>Export</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>Refresh</span>
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

        {/* ============ 5. Results Table (Only after search) ============ */}
        {isSearched && (
          <div className="animate-in fade-in slide-in-from-top-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm duration-300">
            {/* Table Top Bar */}
            <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-6 py-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-gray-800">
                  Found {totalRequests} pending requests
                </span>
              </div>
              <span className="text-xs text-gray-600">
                Total Pending Release:{" "}
                <span className="font-bold text-green-700">{totalRelease}</span>
              </span>
            </div>

            {/* Table with horizontal scroll */}
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
                        No withdrawal requests found.
                      </td>
                    </tr>
                  ) : (
                    currentRequests.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 transition-colors hover:bg-blue-50/50"
                      >
                        <td className="border-r border-gray-100 px-3 py-4 font-medium">
                          {startIndex + index + 1}
                        </td>
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
                        <td className="border-r border-gray-100 px-3 py-4">{item.userId}</td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 font-medium text-gray-800">
                          {item.fullName}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.createdDate}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 font-medium">
                          ${item.totalWithdrawal.toFixed(2)}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4">
                          ${item.adminCharges.toFixed(2)}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 font-medium text-green-700">
                          ${item.release.toFixed(2)}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4">{item.email}</td>
                        <td className="border-r border-gray-100 px-3 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="whitespace-nowrap text-gray-500">
                              {item.wallet || "-"}
                            </span>
                            {item.wallet.trim() && item.wallet !== "-" && (
                              <button
                                type="button"
                                onClick={() => void handleCopyWallet(item.wallet)}
                                className="shrink-0 text-green-600 transition hover:text-green-700"
                                title="Copy wallet address"
                                aria-label="Copy wallet address"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-[10px] font-bold text-yellow-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                            {item.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 text-gray-600">
                          {item.remark}
                        </td>
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

            {/* Table Footer / Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-3 md:flex-row">
              {/* Rows per page */}
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

              {/* Showing text */}
              <div className="text-xs text-gray-600">
                Showing {requests.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(endIndex, requests.length)} of {requests.length} entries
              </div>

              {/* Pagination Buttons */}
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

      {selectedRequest && activeStatusAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdrawal-action-title"
            className="w-full max-w-md rounded-xl border border-blue-200 bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="withdrawal-action-title" className="text-lg font-bold text-gray-900">
                  {activeStatusAction === "approve"
                    ? "Approve withdrawal request"
                    : "Reject withdrawal request"}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedRequest.userId} · ${selectedRequest.totalWithdrawal.toFixed(2)}
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
            <label
              htmlFor="withdrawal-action-remark"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {activeStatusAction === "approve" ? "Approval remark" : "Rejection reason"}
            </label>
            <textarea
              id="withdrawal-action-remark"
              value={statusRemark}
              onChange={(event) => setStatusRemark(event.target.value)}
              placeholder={
                activeStatusAction === "approve"
                  ? "Enter approval remark..."
                  : "Enter rejection reason..."
              }
              rows={3}
              maxLength={500}
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
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
                disabled={isUpdatingStatus || !statusRemark.trim()}
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
  );
}
