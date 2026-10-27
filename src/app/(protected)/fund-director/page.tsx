"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Landmark,
  Loader2,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import Link from "next/link";

type Status = string;
type FundDirectorRecord = {
  id: string;
  date: string;
  type: string;
  amount: number;
  credit?: number;
  debit?: number;
  charges?: number;
  release?: number;
  status: Status;
  reference: string;
  note: string;
  currency?: string;
  walletType?: string;
  walletAddress?: string;
  hash?: string;
};
type TabId = "deposit" | "fiat" | "income" | "p2p" | "withdrawal";
type FiatCurrency = "USDT";
type NetworkType = "TRC20" | "BEP20";

const fiatDepositDetails: Record<
  NetworkType,
  {
    network: string;
    walletAddress: string;
    destinationLabel: string;
  }
> = {
  TRC20: {
    network: "Tron (TRC20)",
    walletAddress: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    destinationLabel: "Wallet Address",
  },
  BEP20: {
    network: "Binance Smart Chain (BEP20)",
    walletAddress: "0x1234567890123456789012345678901234567890",
    destinationLabel: "Wallet Address",
  },
};

const tabs: { id: TabId; label: string; icon: typeof Wallet }[] = [
  { id: "deposit", label: "Self Deposit", icon: ArrowDownLeft },
  // { id: "fiat", label: "Fiat Deposit", icon: Landmark },
  { id: "income", label: "Income Transfer", icon: ArrowLeftRight },
  { id: "p2p", label: "P2P Transfer", icon: Send },
  { id: "withdrawal", label: "Withdrawal", icon: ArrowUpRight },
];

const initialRecords: Record<TabId, FundDirectorRecord[]> = {
  deposit: [],
  fiat: [],
  income: [],
  p2p: [],
  withdrawal: [],
};

const initialBalances = {
  deposit: 0,
  performance: 0,
  yield: 0,
  legacy: 0,
};

const money = (amount: number, currency = "USD") => {
  if (currency === "USDT") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount).replace("$", "USDT");
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const actionMethods: Record<string, "GET" | "POST"> = {
  getUsdtBalance: "POST",
  getVeltBalance: "POST",
  getSelfDepositHistory: "GET",
  requestUsdtDeposit: "POST",
  requestVeltDeposit: "POST",
  getWalletReport: "GET",
  getWithdrawalStatement: "GET",
  sendIncomeTransferOtp: "POST",
  transferIncome: "POST",
  lookupRecipient: "GET",
  getP2pHistory: "GET",
  sendP2pOtp: "POST",
  transferP2p: "POST",
  sendWithdrawalOtp: "POST",
  requestWithdrawal: "POST",
};

async function runFundDirectorAction(action: string, body: Record<string, unknown> = {}) {
  const method = actionMethods[action] || "POST";
  const url = `/api/fund-director/${action}`;

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
  const payload: unknown = await response.json();
  const statusCode =
    isRecord(payload) && typeof payload.statusCode === "number" ? payload.statusCode : undefined;
  if (
    !response.ok ||
    (statusCode !== undefined && statusCode !== 200) ||
    (isRecord(payload) && payload.success === false)
  ) {
    throw new Error(
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "Fund Director request failed.",
    );
  }
  return payload;
}

function getFundRequestRows(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) {
    throw new Error("Fund request history response has an invalid format.");
  }

  const data = payload.data;
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(payload.fundRequests)
      ? payload.fundRequests
      : isRecord(data) && Array.isArray(data.fundRequests)
        ? data.fundRequests
        : isRecord(data) &&
          ("PaymentMode" in data ||
            "Amount" in data ||
            "Rf_Status" in data ||
            "RefrenceNo" in data ||
            "Credit" in data ||
            "Debit" in data ||
            "TransType" in data)
          ? [data]
          : null;

  if (!rows) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : "Fund request history was not included in the response.";
    throw new Error(message);
  }

  return rows.filter(isRecord);
}

function getFirstValue(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  return "";
}

function getNestedValue(payload: unknown, ...keys: string[]): unknown {
  const targetKeys = new Set(keys.map((key) => key.toLowerCase()));
  const pending: unknown[] = [payload];
  const visited = new Set<object>();
  let depth = 0;

  while (pending.length && depth < 5) {
    const currentLevel = pending.splice(0);
    for (const value of currentLevel) {
      if (Array.isArray(value)) {
        pending.push(...value);
        continue;
      }
      if (!isRecord(value) || visited.has(value)) continue;
      visited.add(value);

      for (const [key, nestedValue] of Object.entries(value)) {
        if (
          targetKeys.has(key.toLowerCase()) &&
          nestedValue !== undefined &&
          nestedValue !== null
        ) {
          return nestedValue;
        }
      }
      pending.push(...Object.values(value));
    }
    depth += 1;
  }

  return undefined;
}

function getPayloadData(payload: unknown): unknown {
  return isRecord(payload) && payload.data !== undefined ? payload.data : payload;
}

function getReportRows(payload: unknown, arrayKeys: string[] = []): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) {
    throw new Error("Transaction report response has an invalid format.");
  }
  const data = payload.data;
  if (Array.isArray(data)) return data.filter(isRecord);
  if (isRecord(data)) {
    for (const key of arrayKeys) {
      if (Array.isArray(data[key])) return (data[key] as unknown[]).filter(isRecord);
    }
    if (Object.keys(data).length > 0) return [data];
  }
  for (const key of arrayKeys) {
    if (Array.isArray(payload[key])) return (payload[key] as unknown[]).filter(isRecord);
  }
  if (typeof payload.statusCode === "number" && payload.statusCode === 200) return [];
  throw new Error(
    typeof payload.message === "string"
      ? payload.message
      : "Transaction report data was not included in the response.",
  );
}

function mapFundRequestRecord(item: Record<string, unknown>, index: number): FundDirectorRecord {
  const amountValue = Number(getFirstValue(item, "Amount", "amount"));
  const statusValue = String(getFirstValue(item, "Rf_Status", "Status", "status"));
  const paymentMode = String(
    getFirstValue(item, "PaymentMode", "paymentMode", "Mode", "mode") || "Fiat",
  ).split("-")[0] || "Fiat";
  const reference = String(
    getFirstValue(item, "RefrenceNo", "ReferenceNo", "TransactionHash", "referenceNo", "reference"),
  );

  return {
    id: String(
      getFirstValue(item, "Id", "RequestId", "FundRequestId", "id") || `fund-request-${index + 1}`,
    ),
    date: String(
      getFirstValue(item, "PaymentDate", "CreatedDate", "CreatedOn", "paymentDate", "date"),
    ),
    type: paymentMode,
    amount: Number.isFinite(amountValue) ? amountValue : 0,
    status: statusValue || "Pending",
    reference,
    note: String(getFirstValue(item, "Remark", "remark", "AdminRemark", "adminRemark") || "—"),
    currency: paymentMode.toUpperCase().startsWith("USDT")
      ? "USDT"
      : "USD",
  };
}

function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const normalizedStatus = status.toLowerCase();
  const isRejected = normalizedStatus.includes("reject") || normalizedStatus.includes("unapproved");
  const isApproved = !isRejected && normalizedStatus.includes("approv");
  const Icon = isApproved ? CheckCircle2 : isRejected ? XCircle : Clock3;
  const classes = isApproved
    ? "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-300"
    : isRejected
      ? "border border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/30 dark:text-rose-300"
      : "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function RecordsTable({
  records,
  title = "Transaction history",
  emptyText = "No data available in table",
  loading = false,
  error = "",
  onRetry,
  incomeTransfer = false,
  p2pTransfer = false,
  withdrawalStatement = false,
}: {
  records: FundDirectorRecord[];
  title?: string;
  emptyText?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  incomeTransfer?: boolean;
  p2pTransfer?: boolean;
  withdrawalStatement?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) =>
      [
        record.id,
        record.type,
        record.status,
        record.reference,
        record.note,
        record.walletType,
        record.walletAddress,
        record.hash,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [records, search]);
  const pageCount = Math.max(1, Math.ceil(visibleRecords.length / pageSize));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const pageRecords = visibleRecords.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const copyReference = async (reference: string) => {
    try {
      await navigator.clipboard.writeText(reference);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Could not copy transaction reference:", error);
      toast.error("Could not copy reference.");
    }
  };

  return (
    <section className="relative mt-2 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-xl dark:border-slate-700/60 dark:bg-slate-900/75 sm:rounded-3xl">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-yellow-500" />
      <div className="p-4 sm:p-6 md:p-8">
        <h3 className="mb-5 flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
          <span className="h-7 w-1 rounded-full bg-amber-500" />
          {title}
        </h3>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            Show
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPageIndex(0);
              }}
              className="rounded-xl border-2 border-slate-200 bg-white p-1.5 text-sm font-normal text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            entries
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            Search:
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPageIndex(0);
              }}
              placeholder="Search records..."
              className="w-48 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-slate-700 dark:bg-slate-800 sm:w-56"
            />
          </label>
        </div>
        <div className="w-full overflow-x-auto">
          <table
            className={`w-full ${withdrawalStatement ? "min-w-[1200px]" : p2pTransfer ? "min-w-[800px]" : incomeTransfer ? "min-w-[600px]" : "min-w-[900px]"} text-center text-xs sm:text-sm`}
          >
            <thead className="border-b border-slate-200 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 text-slate-600 dark:border-slate-700 dark:from-amber-900/20 dark:to-yellow-900/20 dark:text-slate-400">
              <tr>
                {(incomeTransfer
                  ? ["#", "Date", "Credit", "Debit", "Remark"]
                  : p2pTransfer
                    ? [
                      "#",
                      "Date",
                      "Credit",
                      "Debit",
                      "Status",
                      "Remark",
                    ]
                    : withdrawalStatement
                      ? [
                        "#",
                        "Date",
                        "Wallet Type",
                        "Request",
                        "Charges",
                        "Release",
                        "Status",
                        "Wallet Address",
                        "Hash",
                      ]
                      : [
                        "#",
                        "Date",
                        "Amount",
                        "Transaction Reference No.",
                        "Payment Mode",
                        "Remark",
                        "Status",
                      ]
                ).map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap p-3 text-xs font-bold uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className={`border-b border-slate-100 text-slate-700 transition-colors hover:bg-amber-50/50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-amber-900/10 ${index % 2 === 0 ? "bg-white/50 dark:bg-slate-800/30" : ""
                    }`}
                >
                  <td className="p-3">{currentPage * pageSize + index + 1}</td>
                  <td className="whitespace-nowrap p-3">{record.date}</td>
                  {incomeTransfer ? (
                    <>
                      <td className="whitespace-nowrap p-3 font-medium text-emerald-700 dark:text-emerald-300">
                        {money(record.credit ?? 0, record.currency ?? "USD")}
                      </td>
                      <td className="whitespace-nowrap p-3 font-medium text-rose-700 dark:text-rose-300">
                        {money(record.debit ?? 0, record.currency ?? "USD")}
                      </td>
                      <td className="p-3">{record.note}</td>
                    </>
                  ) : p2pTransfer ? (
                    <>
                      <td className="whitespace-nowrap p-3">
                        <span className="inline-block rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-300">
                          +{money(record.credit ?? 0, record.currency ?? "USD")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap p-3">
                        <span className="inline-block rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/30 dark:text-rose-300">
                          -{money(record.debit ?? 0, record.currency ?? "USD")}
                        </span>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="p-3">{record.note}</td>
                    </>
                  ) : withdrawalStatement ? (
                    <>
                      <td className="p-3">
                        <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-300">
                          {record.walletType || "General"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap p-3 font-medium text-amber-700 dark:text-amber-300">
                        {record.amount > 0 ? money(record.amount, record.currency ?? "USD") : "—"}
                      </td>
                      <td className="whitespace-nowrap p-3 font-medium text-rose-700 dark:text-rose-300">
                        {(record.charges ?? 0) > 0
                          ? money(record.charges ?? 0, record.currency ?? "USD")
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap p-3 font-medium text-emerald-700 dark:text-emerald-300">
                        {(record.release ?? 0) > 0
                          ? money(record.release ?? 0, record.currency ?? "USD")
                          : "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="whitespace-nowrap p-3 font-medium">
                        {money(record.amount, record.currency ?? "USD")}
                      </td>
                      <td className="p-3">
                        <span className="group relative inline-flex max-w-48 items-center gap-1">
                          <span className="inline-block max-w-36 overflow-hidden text-ellipsis whitespace-nowrap align-middle font-mono">
                            {record.reference.slice(0, 10)}
                            {record.reference.length > 10 ? "..." : ""}
                          </span>
                          {record.reference && (
                            <button
                              type="button"
                              onClick={() => void copyReference(record.reference)}
                              title="Copy transaction reference"
                              aria-label="Copy transaction reference"
                              className="shrink-0 text-slate-400 transition-colors hover:text-amber-600"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-max max-w-72 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            {record.reference}
                          </span>
                        </span>
                      </td>
                      <td className="p-3">{record.type}</td>
                      <td className="p-3">{record.note}</td>
                    </>
                  )}
                  {!incomeTransfer && !p2pTransfer && (
                    <td className="p-3">
                      <StatusBadge status={record.status} />
                    </td>
                  )}
                  {withdrawalStatement && (
                    <>
                      <td className="p-3">
                        {record.walletAddress ? (
                          <button
                            type="button"
                            onClick={() => void copyReference(record.walletAddress ?? "")}
                            title="Copy wallet address"
                            className="inline-flex max-w-40 items-center gap-1 text-xs text-slate-600 hover:text-amber-600 dark:text-slate-300"
                          >
                            <span className="truncate">{record.walletAddress}</span>
                            <Copy className="h-3.5 w-3.5 shrink-0" />
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3">
                        {record.hash ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="max-w-28 truncate font-mono" title={record.hash}>
                              {record.hash}
                            </span>
                            <button
                              type="button"
                              onClick={() => void copyReference(record.hash ?? "")}
                              title="Copy transaction hash"
                              aria-label="Copy transaction hash"
                              className="text-slate-400 hover:text-amber-600"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {loading && (
                <tr>
                  <td
                    colSpan={incomeTransfer ? 5 : p2pTransfer ? 6 : withdrawalStatement ? 9 : 7}
                    className="p-8 text-center"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#F5C451]" aria-label="Loading" />
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td
                    colSpan={incomeTransfer ? 5 : p2pTransfer ? 6 : withdrawalStatement ? 9 : 7}
                    className="p-8 text-center text-rose-600 dark:text-rose-300"
                  >
                    <p>{error}</p>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="mt-2 font-semibold underline underline-offset-2"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {!loading && !error && pageRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={incomeTransfer ? 5 : p2pTransfer ? 6 : withdrawalStatement ? 9 : 7}
                    className="p-8 text-center font-bold text-slate-800 dark:text-slate-200"
                  >
                    {emptyText}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-1 pt-3 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Showing{" "}
            <span className="font-semibold">{loading || error ? 0 : pageRecords.length}</span> of{" "}
            <span className="font-semibold">{visibleRecords.length}</span> entries
          </p>
          <div className="flex items-center gap-1">
            {[
              { label: "«", page: 0 },
              { label: "‹", page: Math.max(0, currentPage - 1) },
              { label: String(currentPage + 1), page: currentPage, current: true },
              { label: "›", page: Math.min(pageCount - 1, currentPage + 1) },
              { label: "»", page: pageCount - 1 },
            ].map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                type="button"
                onClick={() => setPageIndex(item.page)}
                disabled={
                  (index < 2 && currentPage === 0) || (index > 2 && currentPage >= pageCount - 1)
                }
                className={`rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${item.current
                  ? "font-bold text-amber-600"
                  : "text-slate-600 hover:bg-amber-100 dark:text-slate-400 dark:hover:bg-amber-900/30"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        min={min}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 dark:border-slate-700 dark:bg-slate-950"
      />
    </label>
  );
}

function PrimaryButton({
  children,
  disabled = false,
  type = "submit",
  onClick,
  className = "",
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#e98d09] to-[#f3a526] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#e98d09]/40 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export default function FundDirectorPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("deposit");

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (requestedTab === "income" || requestedTab === "withdrawal") {
      setActiveTab(requestedTab);
    }
  }, []);

  const [balances, setBalances] = useState(initialBalances);
  const [records, setRecords] = useState(initialRecords);
  const [walletAddress, setWalletAddress] = useState("");
  const [selfBalances, setSelfBalances] = useState({ usdt: 0, velt: 0 });
  const [selfDepositLoading, setSelfDepositLoading] = useState(true);
  const [fiatCurrency, setFiatCurrency] = useState<FiatCurrency | "">("");
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | "">("");
  const [fiatStep, setFiatStep] = useState<1 | 2 | 3>(1);
  const [isSubmittingSelfDeposit, setIsSubmittingSelfDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositReference, setDepositReference] = useState("");
  const [depositDetails, setDepositDetails] = useState("");
  const [depositRemark, setDepositRemark] = useState("");
  const [isSubmittingFiatDeposit, setIsSubmittingFiatDeposit] = useState(false);
  const [incomeWallet, setIncomeWallet] = useState<"performance" | "yield">("performance");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientLookupState, setRecipientLookupState] = useState<
    "idle" | "loading" | "valid" | "invalid"
  >("idle");
  const [recipientLookupError, setRecipientLookupError] = useState("");
  const [p2pAmount, setP2pAmount] = useState("");
  const [p2pOtp, setP2pOtp] = useState("");
  const [p2pOtpSent, setP2pOtpSent] = useState(false);
  const [withdrawWallet, setWithdrawWallet] = useState<"performance" | "yield" | "legacy">(
    "performance",
  );
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [profileWalletAddress, setProfileWalletAddress] = useState("");
  const [profileWalletAddressError, setProfileWalletAddressError] = useState("");
  const [profileWalletAddressLoading, setProfileWalletAddressLoading] = useState(true);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawalEmailOtp, setWithdrawalEmailOtp] = useState("");
  const [withdrawalEmailOtpSent, setWithdrawalEmailOtpSent] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [checkingTwoFactor, setCheckingTwoFactor] = useState(true);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorVerified, setTwoFactorVerified] = useState(false);
  const [validatingTwoFactor, setValidatingTwoFactor] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [fiatHistoryLoading, setFiatHistoryLoading] = useState(false);
  const [fiatHistoryError, setFiatHistoryError] = useState("");
  const [incomeHistoryLoading, setIncomeHistoryLoading] = useState(false);
  const [incomeHistoryError, setIncomeHistoryError] = useState("");
  const [withdrawalHistoryLoading, setWithdrawalHistoryLoading] = useState(false);
  const [withdrawalHistoryError, setWithdrawalHistoryError] = useState("");
  const [walletDataError, setWalletDataError] = useState("");

  useEffect(() => {
    const loadProfileWalletAddress = async () => {
      setProfileWalletAddressError("");
      try {
        const response = await fetch("/api/auth/profile-details");
        const payload: unknown = await response.json();
        if (!response.ok || !isRecord(payload) || payload.success !== true) {
          throw new Error(
            isRecord(payload) && typeof payload.message === "string"
              ? payload.message
              : "Could not load your profile wallet address.",
          );
        }

        const profileResponse = payload.data;
        const profileRows =
          isRecord(profileResponse) && Array.isArray(profileResponse.data)
            ? profileResponse.data
            : Array.isArray(profileResponse)
              ? profileResponse
              : [];
        const profile = isRecord(profileRows[0]) ? profileRows[0] : null;
        const address = profile
          ? getFirstValue(profile, "walletBep20", "WalletBep20", "walletAddress", "WalletAddress")
          : "";
        const normalizedAddress = typeof address === "string" ? address.trim() : "";

        setProfileWalletAddress(normalizedAddress);
        setWithdrawAddress(normalizedAddress);
      } catch (error) {
        console.error("Could not load profile BEP20 wallet address:", error);
        setProfileWalletAddressError(
          error instanceof Error ? error.message : "Could not load your profile wallet address.",
        );
      } finally {
        setProfileWalletAddressLoading(false);
      }
    };

    void loadProfileWalletAddress();
  }, []);

  useEffect(() => {
    const login = recipient.trim();
    setRecipientName("");
    setRecipientLookupError("");
    if (!login) {
      setRecipientLookupState("idle");
      return;
    }

    setRecipientLookupState("loading");
    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/fund-director/lookupRecipient?authLogin=${encodeURIComponent(login)}`,
        );
        const payload: unknown = await response.json();

        if (
          !response.ok ||
          (isRecord(payload) && payload.success === false) ||
          (isRecord(payload) &&
            typeof payload.statusCode === "number" &&
            payload.statusCode !== 200)
        ) {
          throw new Error(
            isRecord(payload) && typeof payload.message === "string"
              ? payload.message
              : "Recipient username was not found.",
          );
        }

        const data =
          isRecord(payload) && isRecord(payload.data)
            ? payload.data
            : isRecord(payload)
              ? payload
              : null;
        const resolvedLogin = data ? getFirstValue(data, "authLogin", "AuthLogin") : undefined;
        const name = data ? getFirstValue(data, "name", "Name", "userName", "UserName") : undefined;
        const hasResolvedLogin =
          (typeof resolvedLogin === "string" || typeof resolvedLogin === "number") &&
          String(resolvedLogin).trim().length > 0;
        if (
          !data ||
          (!hasResolvedLogin && (typeof name !== "string" || !name.trim())) ||
          (hasResolvedLogin && String(resolvedLogin).toLowerCase() !== login.toLowerCase())
        ) {
          throw new Error("Recipient username was not found.");
        }
        if (!cancelled) {
          setRecipientName(typeof name === "string" && name.trim() ? name.trim() : login);
          setRecipientLookupState("valid");
        }
      } catch (error) {
        if (!cancelled) {
          setRecipientLookupState("invalid");
          setRecipientLookupError(
            error instanceof Error ? error.message : "Could not verify recipient username.",
          );
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [recipient]);

  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      setCheckingTwoFactor(true);
      try {
        const twoFactorResponse = await fetch("/api/auth/generate-2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: "" }),
        });
        const result: unknown = await twoFactorResponse.json();
        const data = isRecord(result) && isRecord(result.data) ? result.data : null;
        const message =
          (data && typeof data.Message === "string" ? data.Message : "") ||
          (data && typeof data.message === "string" ? data.message : "") ||
          (isRecord(result) && typeof result.message === "string" ? result.message : "");

        if (!twoFactorResponse.ok || (isRecord(result) && result.success === false)) {
          throw new Error(message || "Could not check 2FA status.");
        }

        const alreadyEnabled = message.toLowerCase().includes("already enabled");
        setTwoFactorEnabled(alreadyEnabled);
        if (!alreadyEnabled) {
          setTwoFactorError("Enable 2FA from your profile before requesting a withdrawal.");
        }
      } catch (error) {
        console.error("Could not check withdrawal 2FA status:", error);
        setTwoFactorError(error instanceof Error ? error.message : "Could not check 2FA status.");
      } finally {
        setCheckingTwoFactor(false);
      }
    };

    void checkTwoFactorStatus();
  }, []);

  const loadFiatHistory = useCallback(async () => {
    setFiatHistoryLoading(true);
    setFiatHistoryError("");

    try {
      const response = await fetch("/api/FundManager/getFundRequestbyUser");
      const payload: unknown = await response.json();

      const statusCode =
        isRecord(payload) && typeof payload.statusCode === "number"
          ? payload.statusCode
          : undefined;
      if (!response.ok || (statusCode !== undefined && statusCode !== 200)) {
        const message =
          isRecord(payload) && typeof payload.message === "string"
            ? payload.message
            : "Failed to fetch fiat deposit transaction history.";
        throw new Error(message);
      }

      const apiRecords = getFundRequestRows(payload).map(mapFundRequestRecord);
      setRecords((current) => ({ ...current, fiat: apiRecords }));
    } catch (error) {
      console.error("Could not load fiat deposit history:", error);
      setFiatHistoryError(
        error instanceof Error
          ? error.message
          : "Failed to fetch fiat deposit transaction history.",
      );
    } finally {
      setFiatHistoryLoading(false);
    }
  }, []);

  const loadSelfDepositData = useCallback(async () => {
    setSelfDepositLoading(true);
    try {
      const [usdtResult, veltResult, historyResult] = await Promise.allSettled([
        runFundDirectorAction("getUsdtBalance"),
        runFundDirectorAction("getVeltBalance"),
        runFundDirectorAction("getSelfDepositHistory"),
      ]);

      if (usdtResult.status === "fulfilled") {
        const usdtPayload = usdtResult.value;
        const depositAddress = getNestedValue(
          usdtPayload,
          "WalletAddress",
          "walletAddress",
          "walletBep20",
          "usdtWalletAddress",
        );
        setWalletAddress(typeof depositAddress === "string" ? depositAddress.trim() : "");
        setSelfBalances((current) => ({
          ...current,
          usdt: Number(getNestedValue(usdtPayload, "USDTBalance", "usdtBalance")) || 0,
        }));
      } else {
        console.error("Could not load USDT self deposit details:", usdtResult.reason);
        toast.error(
          usdtResult.reason instanceof Error
            ? usdtResult.reason.message
            : "Could not load USDT deposit wallet details.",
        );
      }

      if (veltResult.status === "fulfilled") {
        setSelfBalances((current) => ({
          ...current,
          velt: Number(getNestedValue(veltResult.value, "VELTBalance", "velttBalance")) || 0,
        }));
      } else {
        console.error("Could not load VELT self deposit balance:", veltResult.reason);
      }

      if (historyResult.status === "fulfilled") {
        try {
          const rows = getFundRequestRows(historyResult.value);
          const history = rows.map((item, index) => ({
            id: String(getFirstValue(item, "Id", "id") || `self-deposit-${index + 1}`),
            date: String(getFirstValue(item, "creadtedDate", "CreatedDate", "date")),
            type: "Self deposit",
            amount: Number(getFirstValue(item, "usdAmount", "UsdAmount", "amount")) || 0,
            status: String(getFirstValue(item, "status", "Status") || "Pending"),
            reference: String(getFirstValue(item, "transHash", "TransHash", "hash")),
            note: "—",
            currency: "USD",
          }));
          setRecords((current) => ({ ...current, deposit: history }));
        } catch (error) {
          console.error("Could not parse self deposit history:", error);
        }
      } else {
        console.error("Could not load self deposit history:", historyResult.reason);
      }
    } finally {
      setSelfDepositLoading(false);
    }
  }, []);

  const loadWalletReport = useCallback(async () => {
    setWalletDataError("");
    try {
      const response = await fetch("/api/FundManager");
      const payload: unknown = await response.json();
      const statusCode =
        isRecord(payload) && typeof payload.statusCode === "number"
          ? payload.statusCode
          : undefined;
      if (
        !response.ok ||
        (statusCode !== undefined && statusCode !== 200) ||
        (isRecord(payload) && payload.success === false)
      ) {
        throw new Error(
          isRecord(payload) && typeof payload.message === "string"
            ? payload.message
            : "Could not load wallet balances.",
        );
      }
      const data = getPayloadData(payload);
      if (!isRecord(data)) {
        throw new Error("Wallet balance response has an invalid format.");
      }
      setBalances({
        deposit: Number(data.DepositWallet ?? data.depositWallet) || 0,
        performance: Number(data.IncomeWallet ?? data.incomeWallet) || 0,
        yield: Number(data.RentWallet ?? data.rentWallet) || 0,
        legacy: Number(data.LegacyWallet ?? data.legacyWallet) || 0,
      });
    } catch (error) {
      console.error("Could not load Fund Director wallet balances:", error);
      setWalletDataError(
        error instanceof Error ? error.message : "Could not load wallet balances.",
      );
    }
  }, []);

  const loadIncomeTransferHistory = useCallback(async () => {
    setIncomeHistoryLoading(true);
    setIncomeHistoryError("");
    try {
      const response = await fetch("/api/fund-director/getWalletReport");
      const payload: unknown = await response.json();
      const statusCode =
        isRecord(payload) && typeof payload.statusCode === "number"
          ? payload.statusCode
          : undefined;
      if (
        !response.ok ||
        (statusCode !== undefined && statusCode !== 200) ||
        (isRecord(payload) && payload.success === false)
      ) {
        throw new Error(
          isRecord(payload) && typeof payload.message === "string"
            ? payload.message
            : "Could not load income transfer history.",
        );
      }

      const rows = getReportRows(payload, [
        "transferIncomeToDepositWalletReport",
        "TransferIncomeToDepositWalletReport",
        "incomeTransferReport",
        "IncomeTransferReport",
        "report",
        "Report",
      ]);
      setRecords((current) => ({
        ...current,
        income: rows.map((item, index) => {
          const amount = Number(
            getFirstValue(item, "trnsamount", "TrnsAmount", "TransferAmount", "Amount", "amount"),
          );
          const transferType = String(
            getFirstValue(item, "WalletType", "walletType", "PaymentMode", "paymentMode") ||
            "Income Transfer",
          );
          return {
            id: String(
              getFirstValue(item, "Id", "ID", "id", "TransactionId", "TransferId") ||
              `income-transfer-${index + 1}`,
            ),
            date: String(
              getFirstValue(
                item,
                "CreatedDate",
                "createdDate",
                "TransferDate",
                "TransDate",
                "Date",
                "date",
              ),
            ),
            type: transferType,
            amount: Number.isFinite(amount) ? amount : 0,
            credit: Number(getFirstValue(item, "Credit", "credit")) || 0,
            debit: Number(getFirstValue(item, "Debit", "debit")) || 0,
            status: String(
              getFirstValue(item, "TrStatus", "trStatus", "Status", "status") || "Unknown",
            ),
            reference: String(
              getFirstValue(
                item,
                "TransactionReference",
                "TransactionReferenceNo",
                "ReferenceNo",
                "TransHash",
                "reference",
              ),
            ),
            note: String(getFirstValue(item, "Remark", "remark") || "—"),
            currency: "USD",
          };
        }),
      }));
    } catch (error) {
      console.error("Could not load income transfer history:", error);
      setIncomeHistoryError(
        error instanceof Error ? error.message : "Could not load income transfer history.",
      );
    } finally {
      setIncomeHistoryLoading(false);
    }
  }, []);

  const loadP2pHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/fund-director/getP2pHistory");
      const payload: unknown = await response.json();
      if (!response.ok || (isRecord(payload) && payload.success === false)) {
        throw new Error(
          isRecord(payload) && typeof payload.message === "string"
            ? payload.message
            : "Could not load P2P history.",
        );
      }
      const rows = getFundRequestRows(payload);
      setRecords((current) => ({
        ...current,
        p2p: rows.map((item, index) => ({
          id: String(getFirstValue(item, "Id", "ID", "id") || `p2p-${index + 1}`),
          date: String(getFirstValue(item, "CreatedDate", "createdDate", "date")),
          type: String(
            getFirstValue(item, "TransType", "transType", "Type", "type") || "P2P transfer",
          ),
          amount: Number(getFirstValue(item, "trnsamount", "Amount", "amount")) || 0,
          credit: Number(getFirstValue(item, "Credit", "credit")) || 0,
          debit: Number(getFirstValue(item, "Debit", "debit")) || 0,
          status: String(getFirstValue(item, "TrStatus", "Status", "status") || "Pending"),
          reference: String(
            getFirstValue(item, "TransactionReference", "ReferenceNo", "reference"),
          ),
          note: String(getFirstValue(item, "Remark", "remark") || "—"),
          currency: "USD",
        })),
      }));
    } catch (error) {
      console.error("Could not load P2P history:", error);
      toast.error(error instanceof Error ? error.message : "Could not load P2P history.");
    }
  }, []);

  const loadWithdrawalStatement = useCallback(async () => {
    setWithdrawalHistoryLoading(true);
    setWithdrawalHistoryError("");
    try {
      const response = await fetch("/api/fund-director/getWithdrawalStatement");
      const payload: unknown = await response.json();
      const statusCode =
        isRecord(payload) && typeof payload.statusCode === "number"
          ? payload.statusCode
          : undefined;
      if (
        !response.ok ||
        (statusCode !== undefined && statusCode !== 200) ||
        (isRecord(payload) && payload.success === false)
      ) {
        throw new Error(
          isRecord(payload) && typeof payload.message === "string"
            ? payload.message
            : "Could not load withdrawal statement.",
        );
      }

      const rows = getReportRows(payload, [
        "incomeWalletStatement",
        "IncomeWalletStatement",
        "userIncomeWalletStatement",
        "UserIncomeWalletStatement",
        "statement",
        "Statement",
      ]);
      setRecords((current) => ({
        ...current,
        withdrawal: rows.map((item, index) => ({
          id: String(getFirstValue(item, "ID", "Id", "id") || `withdrawal-${index + 1}`),
          date: String(
            getFirstValue(item, "CreatedDate", "createdDate", "Date", "date", "TransDate"),
          ),
          type: String(getFirstValue(item, "WalletType", "walletType") || "General"),
          walletType: String(getFirstValue(item, "WalletType", "walletType") || "General"),
          amount:
            Number(
              getFirstValue(item, "Request", "request", "Debit", "debit", "Amount", "amount"),
            ) || 0,
          charges: Number(getFirstValue(item, "Charges", "charges")) || 0,
          release: Number(getFirstValue(item, "Release", "release", "Credit", "credit")) || 0,
          status: String(
            getFirstValue(item, "trStatus", "TrStatus", "Status", "status") || "Unknown",
          ),
          reference: String(getFirstValue(item, "TransHash", "transHash", "Hash", "hash")),
          hash: String(getFirstValue(item, "TransHash", "transHash", "Hash", "hash")),
          walletAddress: String(
            getFirstValue(item, "WalletAddress", "walletAddress", "Wallet", "wallet"),
          ),
          note: String(getFirstValue(item, "Remark", "remark") || "—"),
          currency: "USD",
        })),
      }));
    } catch (error) {
      console.error("Could not load withdrawal wallet statement:", error);
      setWithdrawalHistoryError(
        error instanceof Error ? error.message : "Could not load withdrawal statement.",
      );
    } finally {
      setWithdrawalHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "fiat") {
      void loadFiatHistory();
    }
  }, [activeTab, loadFiatHistory]);

  useEffect(() => {
    if (activeTab === "deposit") {
      void loadSelfDepositData();
    } else if (activeTab === "income" || activeTab === "p2p" || activeTab === "withdrawal") {
      void loadWalletReport();
    }
    if (activeTab === "income") {
      void loadIncomeTransferHistory();
    }
    if (activeTab === "p2p") {
      void loadP2pHistory();
    }
    if (activeTab === "withdrawal") {
      void loadWithdrawalStatement();
    }
  }, [
    activeTab,
    loadIncomeTransferHistory,
    loadP2pHistory,
    loadSelfDepositData,
    loadWalletReport,
    loadWithdrawalStatement,
  ]);

  const copyAddress = async () => {
    if (!walletAddress) {
      toast.error("Deposit wallet address is unavailable.");
      return;
    }
    try {
      await navigator.clipboard.writeText(walletAddress);
      toast.success("Wallet address copied");
    } catch (error) {
      console.error("Could not copy the wallet address:", error);
      toast.error("Could not copy address. Please copy it manually.");
    }
  };

  const copyFiatValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Could not copy fiat deposit detail:", error);
      toast.error("Could not copy this value.");
    }
  };

  const submitSelfDeposit = async (asset: "USDT" | "VELT") => {
    const balance = asset === "USDT" ? selfBalances.usdt : selfBalances.velt;
    if (balance < 10) {
      toast.error(`A minimum ${asset} balance of 10 is required to submit a deposit.`);
      return;
    }
    const action = asset === "USDT" ? "requestUsdtDeposit" : "requestVeltDeposit";
    setIsSubmittingSelfDeposit(true);
    try {
      const payload = await runFundDirectorAction(action);
      toast.success(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Deposit request submitted.",
      );
      await loadSelfDepositData();
    } catch (error) {
      console.error("Could not submit self deposit request:", error);
      toast.error(error instanceof Error ? error.message : "Could not submit deposit request.");
    } finally {
      setIsSubmittingSelfDeposit(false);
    }
  };

  const submitFiatDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(depositAmount);
    if (!selectedNetwork) {
      toast.error("Select a network first.");
      setFiatStep(1);
      return;
    }
    if (!/^(?:\d{1,7})(?:\.\d{1,4})?$/.test(depositAmount) || amount < 10) {
      toast.error("Enter a valid amount of at least 10 (up to 4 decimal places).");
      return;
    }
    if (depositReference.trim().length < 10 || depositReference.trim().length > 70) {
      toast.error("Transaction reference must be between 10 and 70 characters.");
      return;
    }
    setIsSubmittingFiatDeposit(true);
    try {
      const response = await fetch("/api/FundManager/addFundRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMode: `${fiatCurrency}-${selectedNetwork}`,
          amount,
          refrenceNo: depositReference.trim(),
          depositDetails: depositDetails.trim() || fiatDepositDetails[selectedNetwork].walletAddress,
          remark: depositRemark.trim(),
        }),
      });
      const payload: unknown = await response.json();
      const resultStatus =
        isRecord(payload) && typeof payload.statusCode === "number"
          ? payload.statusCode
          : undefined;
      const isBusinessError = isRecord(payload) && payload.success === false;

      if (!response.ok || (resultStatus !== undefined && resultStatus !== 200) || isBusinessError) {
        const message =
          isRecord(payload) && typeof payload.message === "string"
            ? payload.message
            : "Failed to submit fiat deposit request.";
        throw new Error(message);
      }

      toast.success(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Fund request submitted successfully.",
      );
      setDepositAmount("");
      setDepositReference("");
      setDepositDetails("");
      setDepositRemark("");
      setFiatCurrency("");
      setFiatStep(1);
      await loadFiatHistory();
    } catch (error) {
      console.error("Could not submit fiat deposit request:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit fiat deposit request.",
      );
    } finally {
      setIsSubmittingFiatDeposit(false);
    }
  };

  const submitIncomeTransfer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(incomeAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > balances[incomeWallet]) {
      toast.error("Enter an amount within the selected wallet balance");
      return;
    }
    if (!otpSent) {
      try {
        // const payload = await runFundDirectorAction("sendIncomeTransferOtp");
        setOtp("");
        setOtpSent(true);
        // toast.success(
        //   isRecord(payload) && typeof payload.message === "string"
        //     ? payload.message
        //     : "Verification code sent.",
        // );
      } catch (error) {
        console.error("Could not send income transfer OTP:", error);
        toast.error(error instanceof Error ? error.message : "Could not send OTP.");
      }
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit OTP sent to your registered email.");
      return;
    }
    try {
      const payload = await runFundDirectorAction("transferIncome", {
        trnsamount: incomeAmount,
        walletType: incomeWallet === "performance" ? 1 : 2,
        otp,
      });
      setIncomeAmount("");
      setOtp("");
      setOtpSent(false);
      toast.success(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Wallet transfer completed.",
      );
      // Invalidate dashboard summary query to refresh Navbar data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });
      await Promise.all([loadWalletReport(), loadIncomeTransferHistory()]);
    } catch (error) {
      console.error("Could not transfer wallet income:", error);
      toast.error(error instanceof Error ? error.message : "Wallet transfer failed.");
    }
  };

  const submitP2pTransfer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(p2pAmount);
    if (!recipient.trim() || !Number.isFinite(amount) || amount <= 0 || amount > balances.deposit) {
      toast.error("Enter a recipient and an amount within your deposit balance");
      return;
    }
    if (recipientLookupState !== "valid") {
      toast.error(
        recipientLookupError || "Wait for the recipient username to be verified before continuing.",
      );
      return;
    }
    if (!p2pOtpSent) {
      try {
        // const payload = await runFundDirectorAction("sendP2pOtp");
        setP2pOtp("");
        setP2pOtpSent(true);
        // toast.success(
        //   isRecord(payload) && typeof payload.message === "string"
        //     ? payload.message
        //     : "Verification code sent.",
        // );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not send OTP.");
      }
      return;
    }
    // if (!/^\d{6}$/.test(p2pOtp)) {
    //   toast.error("Enter the 6-digit OTP sent to your email.");
    //   return;
    // }
    try {
      const lookup = await fetch(
        `/api/fund-director/lookupRecipient?authLogin=${encodeURIComponent(recipient.trim())}`,
      );
      const lookupPayload: unknown = await lookup.json();
      if (
        !lookup.ok ||
        (isRecord(lookupPayload) && lookupPayload.success === false) ||
        (isRecord(lookupPayload) &&
          typeof lookupPayload.statusCode === "number" &&
          lookupPayload.statusCode !== 200)
      ) {
        throw new Error(
          isRecord(lookupPayload) && typeof lookupPayload.message === "string"
            ? lookupPayload.message
            : "Could not verify the recipient.",
        );
      }
      const payload = await runFundDirectorAction("transferP2p", {
        authLoginReciver: recipient.trim(),
        trnsamount: p2pAmount,
        p2potp: p2pOtp,
      });
      setP2pAmount("");
      setRecipient("");
      setRecipientName("");
      setRecipientLookupState("idle");
      setP2pOtp("");
      setP2pOtpSent(false);
      toast.success(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "P2P transfer completed.",
      );
      // Invalidate dashboard summary query to refresh Navbar data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });
      await Promise.all([loadWalletReport(), loadP2pHistory()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "P2P transfer failed.");
    }
  };

  const submitWithdrawal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount < 10 || amount > balances[withdrawWallet]) {
      toast.error("Enter a valid amount from 10 up to the selected wallet balance");
      return;
    }

    if (!twoFactorEnabled || !twoFactorVerified) {
      toast.error("Verify your authenticator code before requesting a withdrawal.");
      return;
    }
    if (!withdrawalEmailOtpSent || !/^\d{6}$/.test(withdrawalEmailOtp)) {
      toast.error("Send and enter the 6-digit OTP sent to your email.");
      return;
    }
    try {
      const payload = await runFundDirectorAction("requestWithdrawal", {
        amount,
        walletAdress: withdrawAddress.trim(),
        payMode: 1,
        walletType: withdrawWallet === "performance" ? 1 : withdrawWallet === "yield" ? 2 : 0,
        withdrawalotp: withdrawalEmailOtp,
      });
      setWithdrawAmount("");
      setWithdrawAddress(profileWalletAddress);
      setWithdrawalEmailOtp("");
      setWithdrawalEmailOtpSent(false);
      setTwoFactorCode("");
      setTwoFactorVerified(false);
      toast.success(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Withdrawal request submitted.",
      );
      // Invalidate dashboard summary query to refresh Navbar data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });
      await Promise.all([loadWalletReport(), loadWithdrawalStatement()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Withdrawal request failed.");
    }
  };

  const sendTransactionOtp = async () => {
    if (activeTab === "withdrawal") {
      // Temporarily disabled: await runFundDirectorAction("sendWithdrawalOtp");
      setWithdrawalEmailOtpSent(true);
      setWithdrawalEmailOtp("");
      return;
    }

    try {
      const payload = await runFundDirectorAction("sendIncomeTransferOtp");
      setOtpSent(true);
      setOtp("");
      toast.success(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Verification code sent.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send OTP.");
    }
  };

  const validateWithdrawalTwoFactor = async () => {
    if (!/^\d{6}$/.test(twoFactorCode)) {
      setTwoFactorError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setValidatingTwoFactor(true);
    setTwoFactorError("");
    try {
      const response = await fetch("/api/auth/validate-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const result: unknown = await response.json();
      const data = isRecord(result) && isRecord(result.data) ? result.data : null;
      const status = data?.Status !== undefined ? data.Status : data?.status;
      const message = data?.Message || data?.message || (isRecord(result) && result.message);

      if (!response.ok || (isRecord(result) && result.success === false)) {
        throw new Error(
          typeof message === "string" ? message : "Authenticator code validation failed.",
        );
      }
      if (status !== true) {
        throw new Error(
          typeof message === "string" ? message : "Invalid authenticator code. Please try again.",
        );
      }

      setTwoFactorVerified(true);
      toast.success("2FA verified. Continue with your withdrawal.");
    } catch (error) {
      setTwoFactorVerified(false);
      setTwoFactorError(
        error instanceof Error ? error.message : "Authenticator code validation failed.",
      );
    } finally {
      setValidatingTwoFactor(false);
    }
  };

  return (
    <div className="mx-auto w-full space-y-5 pb-8 sm:space-y-6">
      <Surface className="relative overflow-hidden rounded-2xl bg-white/80 shadow-lg backdrop-blur-xl dark:bg-slate-800/80 sm:rounded-3xl">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-500" />
        <div className="relative p-2 sm:p-3 md:p-4">
          <div
            role="tablist"
            aria-label="Fund Director sections"
            className="scrollbar-hide w-full min-w-0 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex w-max min-w-full gap-1 sm:gap-2 md:gap-3">
              {tabs.map(({ id, label, icon: Icon }) => {
                const selected = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setActiveTab(id);
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm md:px-6 md:py-3 ${selected
                      ? "bg-[#e98d09] text-white shadow-sm shadow-[#e98d09]/20"
                      : "text-slate-700 hover:bg-[#e98d09]/10 hover:text-[#c57600] dark:text-slate-200 dark:hover:bg-[#e98d09]/15 dark:hover:text-[#f3a526]"
                      }`}
                  >
                    {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          className="relative mt-2 p-2 transition-all duration-300 sm:mt-3 sm:p-3 md:mt-4 md:p-4"
        >
          {walletDataError &&
            (activeTab === "income" || activeTab === "p2p" || activeTab === "withdrawal") && (
              <div
                role="alert"
                className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300"
              >
                <span>{walletDataError}</span>
                <button
                  type="button"
                  onClick={() => void loadWalletReport()}
                  className="font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            )}
          {activeTab === "deposit" && (
            <div className="space-y-7">
              <Surface className="overflow-hidden p-5 sm:p-6 md:p-8">
                <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                    <span className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-500 to-yellow-600" />
                    Self Deposit
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                    Secure Deposit
                  </div>
                </div>

                {selfDepositLoading ? (
                  <div className="flex min-h-[24rem] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#F5C451]" aria-label="Loading self deposit data" />
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
                    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-950/40 sm:p-6">
                      <div className="grid aspect-square w-full max-w-[272px] place-items-center rounded-2xl border border-amber-200 bg-white p-3 shadow-md ring-4 ring-amber-50 dark:border-slate-600 dark:bg-white dark:ring-amber-950/40">
                        {walletAddress ? (
                          <QRCodeSVG
                            value={walletAddress}
                            size={240}
                            level="M"
                            includeMargin
                            fgColor="#0f172a"
                            bgColor="#ffffff"
                            title="BEP20 deposit wallet QR code"
                            className="h-full w-full"
                          />
                        ) : (
                          <div className="text-center text-slate-500">
                            <QrCode className="mx-auto mb-2 h-8 w-8" />
                            <span className="text-xs">
                              Deposit wallet address is not available yet.
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
                        Scan with your wallet app to deposit using the BEP20 network.
                      </p>

                      <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
                        <div className="min-w-0 flex-none rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">USDT Balance</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                            {money(selfBalances.usdt)}
                          </p>
                        </div>
                        <PrimaryButton
                          type="button"
                          disabled={isSubmittingSelfDeposit}
                          onClick={() => void submitSelfDeposit("USDT")}
                        >
                          <ArrowDownLeft className="h-4 w-4" />
                          {isSubmittingSelfDeposit ? "Processing..." : "USDT Deposit"}
                        </PrimaryButton>
                        {/* <button
                        type="button"
                        disabled={isSubmittingSelfDeposit}
                        onClick={() => void submitSelfDeposit("VELT")}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <ArrowDownLeft className="h-4 w-4" />
                        {isSubmittingSelfDeposit ? "Processing..." : "VELT Deposit"}
                      </button> */}
                      </div>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                          Network
                        </label>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          Binance Smart Chain (BEP20)
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                          Wallet Address
                        </label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                          <code className="min-w-0 flex-1 break-all text-xs text-slate-700 dark:text-slate-300">
                            {walletAddress || "Wallet address unavailable"}
                          </code>
                          <button
                            type="button"
                            onClick={copyAddress}
                            disabled={!walletAddress}
                            aria-label="Copy wallet address"
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-300 dark:hover:bg-amber-900/30"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/5">
                        <p className="font-semibold text-amber-900 dark:text-amber-200">
                          Important Notes:
                        </p>
                        <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-amber-800 dark:text-amber-100/80">
                          <li>Only send supported assets to this wallet.</li>
                          <li>Make sure you are using the correct network: BEP20.</li>
                          <li>Minimum deposit: 10 USDT equivalent.</li>
                          <li>Deposit requests remain pending until confirmed.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Surface>
              {!selfDepositLoading && (
                <RecordsTable records={records.deposit} title="Fund Deposit Records" />
              )}
            </div>
          )}

          {activeTab === "fiat" && (
            <div className="space-y-7">
              <SectionHeading
                title="Fiat Deposit"
                description="Submit a fiat deposit request and view your transaction history."
                icon={Landmark}
              />
              {fiatStep === 1 ? (
                <Surface className="p-5 sm:p-7">
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                    Select Network
                  </h3>
                  <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                    Choose the network for your USDT deposit.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        { value: "TRC20", label: "Tron (TRC20)", flag: "🔗" },
                        { value: "BEP20", label: "Binance Smart Chain (BEP20)", flag: "⚡" },
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => {
                          setSelectedNetwork(mode.value);
                          setFiatCurrency("USDT");
                          setFiatStep(2);
                        }}
                        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-amber-500 hover:bg-amber-50/60 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-amber-900/20"
                      >
                        <span className="text-3xl" aria-hidden="true">
                          {mode.flag}
                        </span>
                        <span>
                          <span className="block font-bold text-slate-900 dark:text-white">
                            {mode.value}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {mode.label}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </Surface>
              ) : selectedNetwork && fiatStep === 2 ? (
                <Surface className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-amber-50/50 p-5 shadow-xl dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 sm:p-8 lg:p-10">
                  <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
                    <div className="mx-auto w-full max-w-sm rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5 shadow-xl dark:border-slate-700 dark:from-slate-800 dark:to-slate-700">
                      <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 dark:border-amber-800/40 dark:bg-amber-900/20">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            💎 Payment Mode
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {fiatCurrency}
                          </p>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-800/40 dark:bg-emerald-900/20">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            🌐 Network
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {fiatDepositDetails[selectedNetwork].network}
                          </p>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-800/40 dark:bg-emerald-900/20">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            💳 Wallet Address
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-xs font-bold tracking-wider text-slate-800 dark:text-white break-all">
                              {fiatDepositDetails[selectedNetwork].walletAddress}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                void copyFiatValue(fiatDepositDetails[selectedNetwork].walletAddress)
                              }
                              aria-label="Copy wallet address"
                              className="rounded-lg p-2 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30 shrink-0"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 md:pt-2">
                      <div>
                        <p className="pb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {fiatDepositDetails[selectedNetwork].destinationLabel}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-600 dark:bg-slate-700/50">
                          <span className="break-all text-sm text-slate-600 dark:text-slate-300">
                            {fiatDepositDetails[selectedNetwork].walletAddress}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              void copyFiatValue(fiatDepositDetails[selectedNetwork].walletAddress)
                            }
                            className="rounded-lg bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-400"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-800/30 dark:from-amber-900/10 dark:to-yellow-900/10">
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                          ⚠️ Important Notes:
                        </p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-amber-600 dark:text-amber-400">
                          <li>Only send USDT to this wallet address</li>
                          <li>Make sure you are using the correct network: {selectedNetwork}</li>
                          <li>Minimum deposit: 10 USDT equivalent</li>
                          <li>Deposits will be credited after payment verification</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiatStep(1)}
                    className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                  >
                    <ArrowDownLeft className="h-4 w-4 rotate-45" />
                    Back
                  </button>
                  <div className="mt-8 text-center">
                    <PrimaryButton
                      type="button"
                      onClick={() => {
                        setDepositDetails(fiatDepositDetails[selectedNetwork].walletAddress);
                        setFiatStep(3);
                      }}
                    >
                      I&apos;ve Made the Transfer
                    </PrimaryButton>
                  </div>
                </Surface>
              ) : selectedNetwork && fiatStep === 3 ? (
                <Surface className="p-5 sm:p-8 lg:p-10">
                  <form onSubmit={submitFiatDeposit} className="relative space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3">
                        <div>
                          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Selected Currency
                          </p>
                          <span className="inline-block rounded-xl bg-amber-100 px-4 py-1.5 font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                            {fiatCurrency}
                          </span>
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Network
                          </p>
                          <span className="inline-block rounded-xl bg-emerald-100 px-4 py-1.5 font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            {selectedNetwork}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiatStep(2)}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/30"
                      >
                        <ArrowDownLeft className="h-4 w-4 rotate-45" />
                        Back
                      </button>
                    </div>
                    <TextField
                      label="Amount Sent *"
                      value={depositAmount}
                      onChange={(value) => {
                        if (/^\d{0,7}(?:\.\d{0,4})?$/.test(value)) setDepositAmount(value);
                      }}
                      placeholder="Enter the amount you sent"
                      type="number"
                      min="10"
                      required
                    />
                    <TextField
                      label="Transaction Reference No. *"
                      value={depositReference}
                      onChange={setDepositReference}
                      placeholder="Enter your transaction Reference No./ID"
                      required
                    />
                    <p className="-mt-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                      You can find the transaction reference number in your wallet&apos;s
                      transaction history.
                    </p>
                    <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800/30 dark:bg-amber-900/10">
                      <p className="font-bold text-amber-700 dark:text-amber-300">📋 Next Steps:</p>
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                        <li>• We will verify your transaction</li>
                        <li>• Your funds will be credited within 1–24 hours</li>
                        <li>You&apos;ll receive a confirmation once processed</li>
                        <li>• Contact support if you need assistance</li>
                      </ul>
                    </div>
                    <PrimaryButton disabled={isSubmittingFiatDeposit}>
                      <Send className="h-4 w-4" />
                      {isSubmittingFiatDeposit ? "Submitting..." : "Submit Deposit"}
                    </PrimaryButton>
                  </form>
                </Surface>
              ) : null}
              <RecordsTable
                records={records.fiat}
                title="Fund Request List"
                loading={fiatHistoryLoading}
                error={fiatHistoryError}
                onRetry={loadFiatHistory}
              />
            </div>
          )}

          {activeTab === "income" && (
            <div className="space-y-7">
              <Surface className="p-5 sm:p-6 md:p-8">
                <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                    <span className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-500 to-yellow-600" />
                    Transfer To Deposit Wallet
                  </h2>
                  {!otpSent && (
                    <label className="flex w-full items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-auto">
                      <Wallet className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
                      <select
                        value={incomeWallet}
                        onChange={(event) =>
                          setIncomeWallet(event.target.value as "performance" | "yield")
                        }
                        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 font-medium outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-auto"
                      >
                        <option value="performance">Working Wallet</option>
                        <option value="yield">ROI Wallet</option>
                      </select>
                    </label>
                  )}
                </div>

                <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-100/70 bg-gradient-to-r from-amber-50/70 to-yellow-50/70 p-4 dark:border-amber-800/30 dark:from-amber-900/10 dark:to-yellow-900/10 sm:flex-row sm:items-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {otpSent
                      ? "Transfer confirmation"
                      : `${incomeWallet === "performance" ? "Working" : "ROI"} Wallet Balance`}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Balance:{" "}
                    <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      {money(otpSent ? balances.deposit : balances[incomeWallet])}
                    </span>
                  </p>
                </div>
                <form onSubmit={submitIncomeTransfer} className="space-y-5">
                  {!otpSent ? (
                    <div className="grid items-end gap-4 sm:grid-cols-2">
                      <TextField
                        label="Amount"
                        value={incomeAmount}
                        onChange={(value) => {
                          if (/^\d{0,7}(?:\.\d{0,4})?$/.test(value)) setIncomeAmount(value);
                        }}
                        placeholder="Enter the amount"
                        type="number"
                        min="1"
                      />
                      <PrimaryButton
                        disabled={
                          !incomeAmount ||
                          Number(incomeAmount) < 1 ||
                          Number(incomeAmount) > balances[incomeWallet]
                        }
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Send OTP
                      </PrimaryButton>
                    </div>
                  ) : (
                    <>
                      {/* <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-200">
                        Enter the 6-digit code sent to your registered email to confirm this
                        transfer.
                      </div> */}
                      <label className="block max-w-md space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Enter OTP <span className="text-rose-500">*</span>
                        <input
                          value={otp}
                          onChange={(event) =>
                            setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          required
                          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-[6px] outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <PrimaryButton disabled={otp.length !== 6}>
                          <ShieldCheck className="h-4 w-4" />
                          Confirm Transfer
                        </PrimaryButton>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                          }}
                          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Back
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </Surface>
              <RecordsTable
                records={records.income}
                title="Income Transfer History"
                loading={incomeHistoryLoading}
                error={incomeHistoryError}
                onRetry={loadIncomeTransferHistory}
                incomeTransfer
              />
            </div>
          )}

          {activeTab === "p2p" && (
            <div className="space-y-7">
              <Surface className="p-5 sm:p-6 md:p-8">
                <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                    <span className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-500 to-yellow-600" />
                    Transfer To Deposit Wallet
                  </h2>
                  <div className="rounded-xl border border-amber-100/70 bg-gradient-to-r from-amber-50/70 to-yellow-50/70 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-amber-800/30 dark:from-amber-900/10 dark:to-yellow-900/10 dark:text-slate-300">
                    Balance:{" "}
                    <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      {money(balances.deposit)}
                    </span>
                  </div>
                </div>

                <form onSubmit={submitP2pTransfer} className="space-y-5">
                  {!p2pOtpSent ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Username <span className="text-rose-500">*</span>
                          <div className="relative">
                            <input
                              value={recipient}
                              onChange={(event) => {
                                setRecipient(event.target.value);
                                setP2pOtp("");
                                setP2pOtpSent(false);
                              }}
                              placeholder="Enter username"
                              autoComplete="username"
                              required
                              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </div>
                          {recipientLookupState === "loading" && (
                            <span className="text-xs text-slate-500">Checking username…</span>
                          )}
                          {recipientLookupError && (
                            <span role="alert" className="text-xs text-rose-600 dark:text-rose-300">
                              {recipientLookupError}
                            </span>
                          )}
                          {recipientLookupState === "valid" && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-300">
                              Username verified
                            </span>
                          )}
                        </label>
                        <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Name
                          <input
                            value={recipientName}
                            placeholder="Name will appear after username verification"
                            readOnly
                            className="w-full cursor-not-allowed rounded-xl border-2 border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
                          />
                        </label>
                      </div>
                      <div className="grid items-end gap-4 md:grid-cols-2">
                        <TextField
                          label="Amount (USD)"
                          value={p2pAmount}
                          onChange={setP2pAmount}
                          placeholder="Enter amount"
                          type="number"
                          min="1"
                        />
                        <PrimaryButton
                          disabled={
                            recipientLookupState !== "valid" ||
                            !Number.isFinite(Number(p2pAmount)) ||
                            Number(p2pAmount) <= 0 ||
                            Number(p2pAmount) > balances.deposit
                          }
                        >
                          <Send className="h-4 w-4" />
                          Transfer
                        </PrimaryButton>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-200">
                        A verification code was sent to your registered email for this transfer to{" "}
                        <span className="font-semibold">{recipientName || recipient}</span>.
                      </div> */}
                      <label className="block max-w-md space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Enter OTP <span className="text-rose-500">*</span>
                        <input
                          value={p2pOtp}
                          onChange={(event) =>
                            setP2pOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          required
                          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-[6px] outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                          Enter the 6-digit OTP sent to your registered email to confirm this
                          transfer.
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <PrimaryButton disabled={p2pOtp.length !== 6}>
                          <ShieldCheck className="h-4 w-4" />
                          Confirm Transfer
                        </PrimaryButton>
                        <button
                          type="button"
                          onClick={() => {
                            setP2pOtpSent(false);
                            setP2pOtp("");
                          }}
                          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Back
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </Surface>
              <RecordsTable
                records={records.p2p}
                title="P2P Transfer Report"
                p2pTransfer
                loading={false}
                error=""
              />
            </div>
          )}

          {activeTab === "withdrawal" && (
            <div className="space-y-7">
              <Surface className="p-5 sm:p-6 md:p-8">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                    <span className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-500 to-yellow-600" />
                    Withdrawal Request
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                    Secure Transaction
                  </div>
                </div>

                <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-amber-100/70 bg-gradient-to-r from-amber-50/70 to-yellow-50/70 p-4 dark:border-amber-800/30 dark:from-amber-900/10 dark:to-yellow-900/10 sm:flex-row sm:items-center">
                  <label className="flex w-full items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-auto">
                    <Wallet className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
                    <select
                      value={withdrawWallet}
                      onChange={(event) =>
                        setWithdrawWallet(event.target.value as "performance" | "yield")
                      }
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 font-medium outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-auto"
                    >
                      <option value="performance">Working Wallet</option>
                      <option value="yield">ROI Wallet</option>
                    </select>
                  </label>
                  <div className="whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Balance:{" "}
                    <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      {money(balances[withdrawWallet])}
                    </span>
                  </div>
                </div>

                <form onSubmit={submitWithdrawal} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      label="Amount (USD)"
                      value={withdrawAmount}
                      onChange={setWithdrawAmount}
                      placeholder="Enter amount"
                      type="number"
                      min="10"
                    />
                    <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Wallet Address (BEP20)
                      <input
                        value={withdrawAddress}
                        readOnly
                        placeholder="Add a BEP20 wallet address in your profile"
                        className="w-full cursor-not-allowed rounded-xl border-2 border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
                      />
                      {profileWalletAddressError ? (
                        <span
                          role="alert"
                          className="block text-xs text-rose-600 dark:text-rose-300"
                        >
                          {profileWalletAddressError}
                        </span>
                      ) : !profileWalletAddressLoading && !profileWalletAddress ? (
                        <span className="block text-xs text-amber-700 dark:text-amber-300">
                          No BEP20 address is saved.{" "}
                          <Link
                            href="/profile"
                            className="font-semibold underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-200"
                          >
                            Add one in your profile.
                          </Link>
                        </span>
                      ) : null}
                    </label>
                  </div>

                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Two-factor authentication
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {checkingTwoFactor
                            ? "Checking 2FA status…"
                            : twoFactorVerified
                              ? "2FA verified"
                              : twoFactorEnabled
                                ? "Enter your authenticator code"
                                : "2FA must be enabled to withdraw"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${twoFactorVerified
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                      >
                        {twoFactorVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    {twoFactorEnabled ? (
                      <>
                        <input
                          value={twoFactorCode}
                          onChange={(event) => {
                            setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                            setTwoFactorVerified(false);
                            setTwoFactorError("");
                          }}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          disabled={checkingTwoFactor || validatingTwoFactor || twoFactorVerified}
                          placeholder="Enter 6-digit authenticator code"
                          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-[6px] outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        {!twoFactorVerified && (
                          <PrimaryButton
                            type="button"
                            onClick={validateWithdrawalTwoFactor}
                            disabled={
                              validatingTwoFactor || checkingTwoFactor || twoFactorCode.length !== 6
                            }
                          >
                            <ShieldCheck className="h-4 w-4" />
                            {validatingTwoFactor ? "Verifying…" : "Verify 2FA"}
                          </PrimaryButton>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-rose-600 dark:text-rose-300">
                        {twoFactorError ||
                          "Enable 2FA from your profile before requesting a withdrawal."}
                      </p>
                    )}
                    {twoFactorError && twoFactorEnabled && (
                      <p role="alert" className="text-sm text-rose-600 dark:text-rose-300">
                        {twoFactorError}
                      </p>
                    )}
                    {twoFactorVerified && (
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        2FA verified successfully. You can continue with the withdrawal.
                      </p>
                    )}
                  </div>

                  {twoFactorVerified && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/40">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Email confirmation
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Send and enter the email OTP to confirm your withdrawal request.
                        </p>
                      </div>
                      <PrimaryButton type="button" onClick={sendTransactionOtp}>
                        <ShieldCheck className="h-4 w-4" />
                        {withdrawalEmailOtpSent ? "Email code ready" : "Send email code"}
                      </PrimaryButton>
                      {withdrawalEmailOtpSent && (
                        <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email verification code
                          <input
                            value={withdrawalEmailOtp}
                            onChange={(event) =>
                              setWithdrawalEmailOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="Enter 6-digit email code"
                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-[6px] outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </label>
                      )}
                    </div>
                  )}

                  <PrimaryButton
                    disabled={
                      checkingTwoFactor ||
                      validatingTwoFactor ||
                      !twoFactorEnabled ||
                      !twoFactorVerified ||
                      !withdrawalEmailOtpSent ||
                      withdrawalEmailOtp.length !== 6
                    }
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Submit withdrawal
                  </PrimaryButton>

                  <p className="border-t border-slate-200/70 pt-4 text-center text-xs text-slate-400 dark:border-slate-700/70 dark:text-slate-500">
                    <ShieldCheck className="mr-2 inline h-3.5 w-3.5" />
                    Withdrawal requests are submitted for review and may take 24–48 hours to
                    process.
                  </p>
                </form>
              </Surface>
              <RecordsTable
                records={records.withdrawal}
                title="Withdrawal History"
                loading={withdrawalHistoryLoading}
                error={withdrawalHistoryError}
                onRetry={loadWithdrawalStatement}
                withdrawalStatement
              />
            </div>
          )}
        </div>
      </Surface>
    </div>
  );
}
