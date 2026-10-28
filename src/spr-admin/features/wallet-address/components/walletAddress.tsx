"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/spr-admin/components/ui/Button";
import { ErrorState } from "@/spr-admin/components/ui/ErrorState";
import { apiClient } from "@/spr-admin/lib/api-client";

interface WalletAddressRecord {
  walletAddress: string;
  status: string;
  authlogin: string;
  name: string;
  createdDate: string;
}

interface WalletAddressResponse {
  wallets: WalletAddressRecord[];
  assignCount: number | null;
  pendingAssign: number | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function getRecordValue(record: Record<string, unknown>, field: string): unknown {
  const key = Object.keys(record).find(
    (candidate) => candidate.toLowerCase() === field.toLowerCase(),
  );
  return key ? record[key] : undefined;
}

function normalizeWallets(payload: unknown): WalletAddressResponse {
  let current = payload;
  let assignCount: number | null = null;
  let pendingAssign: number | null = null;
  for (let depth = 0; depth < 4; depth += 1) {
    if (Array.isArray(current)) {
      const records = current.filter(isRecord);
      assignCount ??=
        records
          .map((item) => readNumber(getRecordValue(item, "AssignCount")))
          .find((value) => value !== null) ?? null;
      pendingAssign ??=
        records
          .map((item) => readNumber(getRecordValue(item, "PendingAssign")))
          .find((value) => value !== null) ?? null;
      return {
        wallets: records.map((item) => ({
          walletAddress: readText(item.walletAddress ?? item.WalletAddress),
          status: readText(item.status ?? item.Status),
          authlogin: readText(
            item.authlogin ?? item.Authlogin ?? item.AuthLogin ?? item.LoginId ?? item.LoginID,
          ),
          name: readText(item.name ?? item.Name),
          createdDate: readText(item.CreatedDate ?? item.createdDate),
        })),
        assignCount,
        pendingAssign,
      };
    }
    if (!isRecord(current)) return { wallets: [], assignCount, pendingAssign };
    assignCount ??= readNumber(getRecordValue(current, "AssignCount"));
    pendingAssign ??= readNumber(getRecordValue(current, "PendingAssign"));
    current = current.data ?? current.result ?? current.walletAddressData ?? current.allWalletData;
  }
  return { wallets: [], assignCount, pendingAssign };
}

function getApiMessage(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  for (const key of ["message", "Message", "detail", "title"]) {
    if (typeof value[key] === "string" && value[key].trim()) return value[key];
  }
  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = getApiMessage(error.response?.data);
    if (apiMessage) return apiMessage;
  }
  return error instanceof Error && error.message ? error.message : "Please try again.";
}

async function loadWalletAddresses() {
  const response = await apiClient.post<unknown>("/admin/wallet-address/list");
  return normalizeWallets(response);
}

async function generateWalletAddresses(quantity: number) {
  const response = await apiClient.post<unknown, { Quantity: number }>("/admin/wallet-address", {
    Quantity: quantity,
  });
  if (
    isRecord(response) &&
    (response.success === false ||
      response.status === false ||
      response.status === "Failed" ||
      (typeof response.statusCode === "number" && response.statusCode >= 400))
  ) {
    throw new Error(getApiMessage(response) ?? "Failed to generate wallet addresses.");
  }
  return response;
}

export default function ManageUserWalletAddress() {
  const [quantity, setQuantity] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const walletQuery = useQuery({
    queryKey: ["admin-wallet-addresses"],
    queryFn: loadWalletAddresses,
    retry: false,
  });
  const generateMutation = useMutation({
    mutationFn: generateWalletAddresses,
    onSuccess: async (response) => {
      toast.success(getApiMessage(response) ?? "Wallet addresses generated successfully.");
      setQuantity("");
      setCurrentPage(1);
      await queryClient.invalidateQueries({ queryKey: ["admin-wallet-addresses"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || "Failed to generate wallet addresses.");
    },
  });

  const wallets = walletQuery.data?.wallets ?? [];
  const assignCount = walletQuery.data?.assignCount;
  const pendingAssign = walletQuery.data?.pendingAssign;
  const totalPages = Math.max(1, Math.ceil(wallets.length / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * rowsPerPage;
  const pageWallets = wallets.slice(startIndex, startIndex + rowsPerPage);

  function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const count = Number(quantity);
    if (!Number.isSafeInteger(count) || count < 1) {
      toast.error("Enter a quantity greater than zero.");
      return;
    }
    generateMutation.mutate(count);
  }

  async function handleRefresh() {
    setCurrentPage(1);
    const result = await walletQuery.refetch();
    if (result.error) {
      toast.error(getErrorMessage(result.error));
    }
  }

  return (
    <div className="spr-admin-wallet-address flex w-full items-start justify-center px-3 pb-6 pt-2 font-sans sm:px-4">
      <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-5 py-4 sm:px-6">
          <h1 className="flex items-center gap-2 text-lg font-bold text-white">
            <Wallet className="h-5 w-5" aria-hidden />
            Manage User Wallet Address
          </h1>
          <p className="mt-1 text-xs text-white/90">
            Generate and manage wallet addresses for user allocation
          </p>
        </header>

        <div className="p-4 sm:p-6">
          <form
            onSubmit={handleGenerate}
            className="mb-6 flex flex-col items-end gap-3 border-b border-gray-100 pb-6 sm:flex-row"
          >
            <div className="w-full sm:max-w-sm sm:flex-1">
              <label
                htmlFor="wallet-quantity"
                className="mb-1.5 block text-sm font-semibold text-gray-700"
              >
                Quantity
              </label>
              <input
                id="wallet-quantity"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Enter quantity"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <Button
              type="submit"
              isLoading={generateMutation.isPending}
              disabled={walletQuery.isPending || generateMutation.isPending}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 sm:w-auto"
            >
              Generate Address
            </Button>
          </form>

          <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-base font-bold text-gray-900">
              Wallet Addresses
              {!walletQuery.isPending && !walletQuery.error && (
                <span className="ml-2 text-sm font-medium text-gray-500">({wallets.length})</span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-blue-200 bg-white px-3 py-2 shadow-sm">
                  <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                    Assign Count
                    <span className="text-base font-bold text-gray-900">{assignCount ?? "—"}</span>
                  </span>
                </div>
                <div className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 shadow-sm">
                  <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                    Pending Assign
                    <span className="text-base font-bold text-white">{pendingAssign ?? "—"}</span>
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={walletQuery.isFetching}
                onClick={() => void handleRefresh()}
              >
                {walletQuery.isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {walletQuery.isPending ? (
            <div className="flex justify-center rounded-lg border border-gray-200 py-12">
              <Loader2
                className="h-6 w-6 animate-spin text-blue-600"
                aria-label="Loading wallet addresses"
              />
            </div>
          ) : walletQuery.error ? (
            <ErrorState
              title="Wallet addresses could not be loaded"
              description={getErrorMessage(walletQuery.error)}
              onRetry={() => void walletQuery.refetch()}
            />
          ) : (
            <>
              <div className="relative overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[960px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      <th scope="col" className="w-20 px-4 py-3 text-center">
                        S. No.
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Wallet Address
                      </th>
                      <th scope="col" className="w-32 px-4 py-3 text-center">
                        Status
                      </th>
                      <th scope="col" className="w-48 px-4 py-3">
                        Used By (Login ID)
                      </th>
                      <th scope="col" className="w-48 px-4 py-3">
                        Used By (Name)
                      </th>
                      <th scope="col" className="w-40 px-4 py-3">
                        Created Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {wallets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-500">
                          No Data Found
                        </td>
                      </tr>
                    ) : (
                      pageWallets.map((wallet, index) => (
                        <tr
                          key={`${wallet.walletAddress}-${startIndex + index}`}
                          className="transition-colors hover:bg-blue-50/50"
                        >
                          <td className="px-4 py-3 text-center font-medium">
                            {startIndex + index + 1}
                          </td>
                          <td className="break-all px-4 py-3 font-mono text-xs">
                            {wallet.walletAddress || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                /active|available|unused/i.test(wallet.status)
                                  ? "bg-green-100 text-green-800"
                                  : wallet.status
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              {wallet.status || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">{wallet.authlogin || "—"}</td>
                          <td className="px-4 py-3">{wallet.name || "—"}</td>
                          <td className="px-4 py-3">{wallet.createdDate || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {walletQuery.isFetching && (
                  <div
                    className="spr-admin-wallet-refresh absolute inset-0 z-10 flex items-center justify-center bg-white/75"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" aria-hidden />
                      Refreshing wallet addresses...
                    </div>
                  </div>
                )}
              </div>

              {wallets.length > 0 && (
                <footer className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-gray-600 sm:flex-row">
                  <label className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(event) => {
                        setRowsPerPage(Number(event.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {[10, 25, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span>
                    {startIndex + 1}–{Math.min(startIndex + rowsPerPage, wallets.length)} of{" "}
                    {wallets.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label="Previous page"
                      disabled={page <= 1}
                      onClick={() => setCurrentPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </Button>
                    <span className="min-w-12 text-center">
                      {page} / {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label="Next page"
                      disabled={page >= totalPages}
                      onClick={() => setCurrentPage(page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </footer>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
