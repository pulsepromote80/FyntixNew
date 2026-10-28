"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet, Search, Download, RotateCcw, Calendar, User, CreditCard,
  TrendingUp, TrendingDown, Loader2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAccountStatement,
  getTransTypes,
  getUserByAuthLogin,
  type AccountStatementPayload,
  type AccountStatementRow,
} from "../service/adminStatement.service";

export default function WalletStatement() {
  const [isSearched, setIsSearched] = useState(false);

  // Form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [walletType, setWalletType] = useState("");
  const [transType, setTransType] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");

  // Results
  const [rows, setRows] = useState<AccountStatementRow[]>([]);

  // ============================================
  // ⏱️ Debounce userId (500ms)
  // ============================================
  const [debouncedUserId, setDebouncedUserId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserId(userId.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [userId]);

  // ============================================
  // 🔍 User by AuthLogin (auto-fetch username)
  // ============================================
  const { data: userRes, isLoading: userLoading } = useQuery({
    queryKey: ["user-by-auth-login", debouncedUserId],
    queryFn: () => getUserByAuthLogin(debouncedUserId),
    enabled: debouncedUserId.length >= 3,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  // Sync username state
  useEffect(() => {
    if (userRes?.statusCode === 200 && userRes.data) {
      const u = userRes.data;
      setUsername(`${u.FName ?? ""} ${u.LName ?? ""}`.trim());
    } else {
      setUsername("");
    }
  }, [userRes]);

  // ============================================
  // 📋 Transaction Types (wallet select hone pe)
  // ============================================
  const { data: transTypesRes, isLoading: transTypesLoading } = useQuery({
    queryKey: ["trans-types", walletType],
    queryFn: () => getTransTypes(Number(walletType)),
    enabled: !!walletType,
    staleTime: 1000 * 60 * 5,
  });

  const transTypes = transTypesRes?.data?.incomeTransTypes ?? [];

  // ============================================
  // 💾 Mutation — account statement
  // ============================================
  const statementMutation = useMutation({
    mutationFn: (payload: AccountStatementPayload) => getAccountStatement(payload),
    onSuccess: (res) => {
      const data = res.data ?? [];
      setRows(data);
      setIsSearched(true);
      if (data.length === 0) toast.info("No transactions found");
      else toast.success(`${data.length} transactions found`);
    },
  
    onError: (err: unknown) => {
      const e = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        (status === 401
          ? "Unauthorized. Please login again."
          : "Failed to fetch statement.");
      toast.error(msg);
    },
  });

  // ============================================
  // Handlers
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    statementMutation.mutate({
      AuthLogin: userId.trim(),
      transtype: transType,
      FromDate: fromDate,
      ToDate: toDate,
      wtype: walletType ? Number(walletType) : 0,
    });
  };

  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWalletType(e.target.value);
    setTransType("");
  };

  const handleRefresh = () => {
    setFromDate("");
    setToDate("");
    setWalletType("");
    setTransType("");
    setUserId("");
    setUsername("");
    setRows([]);
    setIsSearched(false);
  };

  // Totals
  const totalCredit = rows.reduce((s, r) => s + (Number(r.Credit) || 0), 0);
  const totalDebit = rows.reduce((s, r) => s + (Number(r.Debit) || 0), 0);

  const fmt = (n: number) => `$${n.toFixed(4)}`;

  return (
    <div className="flex w-full items-start justify-center px-4 pb-4 pt-1 font-sans text-gray-900 dark:text-gray-100">
      <div className="w-full flex flex-col gap-4">

        {/* ============ 1. Page Header ============ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Statement</h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                View and manage all wallet transactions
              </p>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>

        {/* ============ 2. Stat Cards ============ */}
        {isSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#111318]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Total Credit
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {fmt(totalCredit)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 dark:bg-green-500/15">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#111318]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Total Debit
                </p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {fmt(totalDebit)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-100 dark:bg-red-500/15">
                <TrendingDown className="w-5 h-5 text-red-600" />
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
              Filter wallet transactions by date, wallet type, or user
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">

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

                {/* Select Wallet */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <Wallet className="h-3.5 w-3.5 text-blue-600" /> Select Wallet
                  </label>
                  <div className="relative">
                    <select
                      value={walletType}
                      onChange={handleWalletChange}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                    >
                      <option value="">-- Select Wallet --</option>
                      <option value="1">Working Wallet</option>
                      <option value="2">Deposit Wallet</option>
                      <option value="3">ROI Wallet</option>
                      <option value="4">Transaction Wallet</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Transaction Type */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <CreditCard className="h-3.5 w-3.5 text-blue-600" /> Transaction Type
                  </label>
                  <div className="relative">
                    <select
                      value={transType}
                      onChange={(e) => setTransType(e.target.value)}
                      disabled={!walletType}
                      className={`w-full appearance-none rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${!walletType
                          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                          : "border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                        }`}
                    >
                      <option value="">Select Transaction</option>

                      {transTypesLoading && (
                        <option disabled>Loading...</option>
                      )}

                      {!transTypesLoading &&
                        transTypes.map((t, idx) => (
                          <option key={`${t.transType}-${idx}`} value={t.transType}>
                            {t.transType}
                          </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {/* User ID — auto-fetch username on type */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5 text-blue-600" /> User ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. FOX140907"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                  />
                </div>

                {/* Username — auto-filled */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5 text-blue-600" /> Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userLoading ? "Loading..." : username}
                    placeholder="Username will appear here"
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={statementMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {statementMutation.isPending ? (
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
                  onClick={handleRefresh}
                  disabled={statementMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-slate-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ============ 4. Results Table ============ */}
        {isSearched && (
          <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#111318]">

            <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-6 py-3 dark:border-blue-900/50 dark:bg-blue-950/30">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  Found {rows.length} transactions
                </span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Credit: <span className="font-bold text-green-700 dark:text-green-400">{fmt(totalCredit)}</span>
                {" | "}
                Debit: <span className="font-bold text-red-700 dark:text-red-400">{fmt(totalDebit)}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1400px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-700 dark:bg-[#191c23] dark:text-gray-300">
                    <th className="px-3 py-3 border-r border-gray-200 text-center w-16">#</th>
                    <th className="px-3 py-3 border-r border-gray-200">Auth Login</th>
                    <th className="px-3 py-3 border-r border-gray-200">Name</th>
                    <th className="px-3 py-3 border-r border-gray-200">Email</th>
                    <th className="px-3 py-3 border-r border-gray-200 text-center">Credit</th>
                    <th className="px-3 py-3 border-r border-gray-200 text-center">Debit</th>
                    <th className="px-3 py-3 border-r border-gray-200">Trans Type</th>
                    <th className="px-3 py-3 border-r border-gray-200">Trans Date</th>
                    <th className="px-3 py-3">Remark</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 dark:text-gray-300">
                  {rows.map((item, idx) => (
                    <tr
                      key={`${item.AuthLogin}-${item.TransDate2}-${idx}`}
                      className="border-b border-gray-100 transition-colors hover:bg-blue-50/70 dark:border-gray-700 dark:hover:bg-blue-500/5"
                    >
                      <td className="px-3 py-4 text-center font-medium border-r border-gray-100">
                        {item.RowNo ?? idx + 1}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 whitespace-nowrap font-mono">
                        {item.AuthLogin}
                      </td>
                      <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 font-medium text-gray-800 dark:border-gray-700 dark:text-gray-100">
                        {item.FullName}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 whitespace-nowrap">
                        {item.email}
                      </td>
                      <td className="border-r border-gray-100 px-3 py-4 text-center font-bold text-green-700 dark:border-gray-700 dark:text-green-400">
                        {item.Credit ? fmt(Number(item.Credit)) : "-"}
                      </td>
                      <td className="border-r border-gray-100 px-3 py-4 text-center font-bold text-red-700 dark:border-gray-700 dark:text-red-400">
                        {item.Debit ? fmt(Number(item.Debit)) : "-"}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 whitespace-nowrap">
                        <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                          {item.TransType}
                        </span>
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 whitespace-nowrap">
                        {item.TransDate}
                      </td>
                      <td className="px-3 py-4 text-gray-600 whitespace-nowrap" title={item.Remark}>
                        {item.Remark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-3 dark:border-gray-700 dark:bg-[#111318] md:flex-row">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span>Rows per page:</span>
                <select className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200">
                  <option>500</option>
                  <option>100</option>
                  <option>50</option>
                </select>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Showing 1 to {rows.length} of {rows.length} entries
              </div>
              <div className="flex items-center gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#1680ff] to-[#25c6e8] text-xs font-bold text-white">
                  1
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}