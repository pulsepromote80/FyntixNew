"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, Loader2, RefreshCw, Search, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";

type ReportTab = "deposit" | "performance" | "yield";
type ReportRow = Record<string, unknown>;

const tabs: { id: ReportTab; label: string }[] = [
  { id: "deposit", label: "Deposit Wallet" },
  { id: "performance", label: "Working Rewards Wallet" },
  { id: "yield", label: "ROI Wallet" },
];

const reportColumns: Record<ReportTab, string[]> = {
  deposit: ["Transaction Type", "Date", "Credit", "Debit", "Remark"],
  performance: ["Transaction Type", "Date", "Credit", "Debit", "Remark"],
  yield: ["Transaction Type", "Date", "Credit", "Debit", "Remark"],
};

const fieldAliases: Record<string, string[]> = {
  "Transaction Type": ["transType", "TransType", "TransactionType"],
  Date: ["CreatedDate", "createdDate", "TransDate", "Date", "date"],
  Credit: ["credit", "Credit"],
  Debit: ["debit", "Debit"],
  Remark: ["Remark", "remark", "Description"],
};

function isRecord(value: unknown): value is ReportRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getValue(record: ReportRow, label: string): unknown {
  const aliases = fieldAliases[label] ?? [label];
  for (const alias of aliases) {
    if (record[alias] !== undefined && record[alias] !== null) return record[alias];
  }
  return undefined;
}

function getErrorMessage(payload: unknown, fallback: string): string {
  const pending: unknown[] = [payload];
  const visited = new Set<object>();
  for (let depth = 0; pending.length > 0 && depth < 5; depth += 1) {
    const level = pending.splice(0);
    for (const value of level) {
      if (Array.isArray(value)) {
        pending.push(...value);
        continue;
      }
      if (!isRecord(value) || visited.has(value)) continue;
      visited.add(value);
      for (const key of ["message", "error", "detail", "title"]) {
        if (typeof value[key] === "string" && value[key].trim()) return value[key];
      }
      pending.push(...Object.values(value));
    }
  }
  return fallback;
}

function getRows(payload: unknown): ReportRow[] {
  if (
    isRecord(payload) &&
    (payload.success === false ||
      (typeof payload.statusCode === "number" && payload.statusCode !== 200))
  ) {
    const status = typeof payload.statusCode === "number" ? ` (status ${payload.statusCode})` : "";
    throw new Error(getErrorMessage(payload, `Could not load wallet report${status}.`));
  }
  if (Array.isArray(payload)) return payload.filter(isRecord);

  // Handle new API structure: { statusCode: 200, data: [...] }
  if (isRecord(payload) && typeof payload.statusCode === "number" && payload.statusCode === 200) {
    if (Array.isArray(payload.data)) {
      return payload.data.filter(isRecord);
    }
  }

  const pending: unknown[] = [payload];
  const visited = new Set<object>();
  for (let depth = 0; depth < 7 && pending.length > 0; depth += 1) {
    const level = pending.splice(0);
    for (const value of level) {
      if (Array.isArray(value)) {
        const records = value.filter(isRecord);
        if (records.length > 0) return records;
        pending.push(...value);
        continue;
      }
      if (!isRecord(value) || visited.has(value)) continue;
      visited.add(value);

      if (
        Object.keys(fieldAliases).some((label) =>
          (fieldAliases[label] ?? []).some((alias) => alias in value),
        )
      ) {
        return [value];
      }
      pending.push(...Object.values(value));
    }
  }
  return [];
}

function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function amountValue(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value: unknown): string {
  // Handle values that already have currency symbols or commas
  if (typeof value === "string") {
    // Remove $ and commas, then format
    const cleaned = value.replace(/[$,]/g, "");
    const num = Number(cleaned);
    if (!Number.isNaN(num)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(num);
    }
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amountValue(value));
}

export function WalletManager() {
  const [activeTab, setActiveTab] = useState<ReportTab>("deposit");
  const [reports, setReports] = useState<Partial<Record<ReportTab, ReportRow[]>>>({});
  const [loaded, setLoaded] = useState<Partial<Record<ReportTab, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const { data: dashboard } = useDashboardSummary();

  const loadReport = useCallback(
    async (tab: ReportTab, force = false) => {
      if (!force && loaded[tab]) return;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/wallet-manager/${tab}`, {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transtype: "" }),
        });
        const payload: unknown = await response.json();
        if (!response.ok) {
          throw new Error(
            getErrorMessage(payload, `Could not load wallet report (HTTP ${response.status}).`),
          );
        }
        const rows = getRows(payload);
        setReports((current) => ({ ...current, [tab]: rows }));
        setLoaded((current) => ({ ...current, [tab]: true }));
      } catch (requestError) {
        // setError(
        //   requestError instanceof Error ? requestError.message : "Could not load wallet report.",
        // );
      } finally {
        setLoading(false);
      }
    },
    [loaded],
  );

  useEffect(() => {
    void loadReport(activeTab);
  }, [activeTab, loadReport]);

  const selectTab = (tab: ReportTab) => {
    setActiveTab(tab);
    setError("");
    setSearch("");
    setTransactionType("all");
    setPageIndex(0);
  };

  const rows = reports[activeTab] ?? [];
  const availableTypes = useMemo(
    () =>
      [...new Set(rows.map((row) => getValue(row, "Transaction Type")).filter(Boolean))].map(
        String,
      ),
    [rows],
  );
  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesType =
        transactionType === "all" ||
        String(getValue(row, "Transaction Type") ?? "").toLowerCase() ===
        transactionType.toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        Object.values(row).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        );
      return matchesType && matchesSearch;
    });
  }, [rows, search, transactionType]);
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const page = Math.min(pageIndex, totalPages - 1);
  const pageRows = visibleRows.slice(page * pageSize, (page + 1) * pageSize);

  const summary = dashboard?.data?.[0];
  const walletBalanceFields: Partial<Record<ReportTab, { label: string; value: number }>> = {
    deposit: {
      label: "Deposit Wallet Balance",
      value: Number(summary?.DepositWallet ?? summary?.DepositWallet ?? 0),
    },
    performance: {
      label: "Working Wallet Balance",
      value: Number(summary?.WorkingWallet ?? summary?.PerformanceWallet ?? 0),
    },
    yield: {
      label: "ROI Wallet Balance",
      value: Number(summary?.YieldWallet ?? summary?.ROIWallet ?? 0),
    },
  };
  const balance = walletBalanceFields[activeTab];
  const columns = reportColumns[activeTab];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
            <Wallet className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Wallet Manager</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review transactions and rewards across your wallets.
            </p>
          </div>
        </div>
        <div
          className="w-full min-w-0 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain p-3"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex w-max min-w-full gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectTab(tab.id)}
                  aria-pressed={isActive}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive
                      ? "bg-[#e98d09] text-white shadow-sm shadow-[#e98d09]/20"
                      : "text-slate-700 hover:bg-[#e98d09]/10 hover:text-[#c57600] dark:text-slate-200 dark:hover:bg-[#e98d09]/15 dark:hover:text-[#f3a526]"
                    }`}
                >
                  <Wallet className="h-4 w-4" aria-hidden />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {balance && (
        <section className="flex items-center justify-between rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm dark:border-blue-800/50 dark:from-blue-950/40 dark:to-indigo-950/30">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {balance.label}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatMoney(balance.value)}
            </p>
          </div>
          <Wallet className="h-7 w-7 text-blue-500" aria-hidden />
        </section>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              {`${tabs.find((tab) => tab.id === activeTab)?.label} Records`}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {visibleRows.length} record{visibleRows.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {availableTypes.length > 0 && (
              <select
                value={transactionType}
                onChange={(event) => {
                  setTransactionType(event.target.value);
                  setPageIndex(0);
                }}
                aria-label="Filter by transaction type"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-auto"
              >
                <option value="all">All Transactions</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
            <label className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPageIndex(0);
                }}
                placeholder="Search records..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-52"
              />
            </label>
            <label className="sr-only" htmlFor="wallet-report-page-size">
              Rows per page
            </label>
            <select
              id="wallet-report-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPageIndex(0);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-auto"
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setPageIndex(0);
                void loadReport(activeTab, true);
              }}
              disabled={loading}
              aria-label="Refresh wallet report"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div
            className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
            role="alert"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void loadReport(activeTab, true)}
                className="font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-blue-50/80 text-xs uppercase tracking-wider text-slate-600 dark:bg-blue-900/20 dark:text-slate-300">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">#</th>
                  {columns.map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-10 text-center"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#F5C451]" aria-label="Loading" />
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, index) => (
                    <tr
                      key={String(
                        row.Id ?? row.ID ?? row.id ?? `${activeTab}-${page * pageSize + index}`,
                      )}
                      className="text-slate-700 transition-colors hover:bg-blue-50/50 dark:text-slate-200 dark:hover:bg-blue-900/10"
                    >
                      <td className="px-4 py-3">{page * pageSize + index + 1}</td>
                      {columns.map((column) => {
                        const value = getValue(row, column);
                        if (column === "Credit" || column === "Debit") {
                          const isCredit = column === "Credit";
                          const Icon = isCredit ? TrendingUp : TrendingDown;
                          return (
                            <td key={column} className="whitespace-nowrap px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${isCredit
                                    ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    : "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/30 dark:text-rose-300"
                                  }`}
                              >
                                <Icon className="h-3.5 w-3.5" aria-hidden />
                                {isCredit ? "+" : "-"}
                                {formatMoney(value)}
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={column} className="max-w-xs px-4 py-3">
                            {column === "Date" && (
                              <Clock3
                                className="mr-1 inline h-3.5 w-3.5 text-slate-400"
                                aria-hidden
                              />
                            )}
                            <span
                              className={column === "Remark" ? "break-words" : "whitespace-nowrap"}
                            >
                              {displayValue(value)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">
          <span>
            Showing <span className="font-semibold">{loading || error ? 0 : pageRows.length}</span>{" "}
            of <span className="font-semibold">{visibleRows.length}</span> entries
            {transactionType !== "all" && (
              <span className="ml-1 text-blue-600 dark:text-blue-400">(filtered)</span>
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Go to first page"
              disabled={page === 0 || loading || Boolean(error)}
              onClick={() => setPageIndex(0)}
              className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-blue-900/30"
            >
              «
            </button>
            <button
              type="button"
              aria-label="Go to previous page"
              disabled={page === 0 || loading || Boolean(error)}
              onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
              className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-blue-900/30"
            >
              ‹
            </button>
            <span className="px-3 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Go to next page"
              disabled={page >= totalPages - 1 || loading || Boolean(error)}
              onClick={() => setPageIndex((current) => Math.min(totalPages - 1, current + 1))}
              className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-blue-900/30"
            >
              ›
            </button>
            <button
              type="button"
              aria-label="Go to last page"
              disabled={page >= totalPages - 1 || loading || Boolean(error)}
              onClick={() => setPageIndex(totalPages - 1)}
              className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-blue-900/30"
            >
              »
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
