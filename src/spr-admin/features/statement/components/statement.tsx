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
    <div className="w-full bg-[#FAF6EC] px-4 pt-1 pb-4 font-sans flex justify-center items-start">
      <div className="w-full flex flex-col gap-4">

        {/* ============ 1. Page Header ============ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#D4AF37] text-gray-900 shadow-sm shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wallet Statement</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                View and manage all wallet transactions
              </p>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-gray-900 rounded-lg text-sm font-bold hover:bg-[#B89328] transition whitespace-nowrap">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>

        {/* ============ 2. Stat Cards ============ */}
        {isSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Total Credit
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {fmt(totalCredit)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Total Debit
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {fmt(totalDebit)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-md bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* ============ 3. Search Filters Card ============ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="bg-[#D4AF37] px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Filters
            </h2>
            <p className="text-gray-800 text-xs mt-1">
              Filter wallet transactions by date, wallet type, or user
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">

                {/* From Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-gray-700"
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-gray-700"
                  />
                </div>

                {/* Select Wallet */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-[#D4AF37]" /> Select Wallet
                  </label>
                  <div className="relative">
                    <select
                      value={walletType}
                      onChange={handleWalletChange}
                      className="w-full appearance-none px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-gray-700"
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" /> Transaction Type
                  </label>
                  <div className="relative">
                    <select
                      value={transType}
                      onChange={(e) => setTransType(e.target.value)}
                      disabled={!walletType}
                      className={`w-full appearance-none px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]
                        ${!walletType
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                          : "bg-white text-gray-700 border-gray-300"
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" /> User ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. FOX140907"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white"
                  />
                </div>

                {/* Username — auto-filled */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userLoading ? "Loading..." : username}
                    placeholder="Username will appear here"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={statementMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-gray-900 rounded-lg text-sm font-bold hover:bg-[#B89328] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-700 transition disabled:opacity-50"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">

            <div className="bg-[#FFF9E6] border-b border-[#D4AF37]/30 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm font-bold text-gray-800">
                  Found {rows.length} transactions
                </span>
              </div>
              <span className="text-xs text-gray-600">
                Credit: <span className="font-bold text-green-700">{fmt(totalCredit)}</span>
                {" | "}
                Debit: <span className="font-bold text-red-700">{fmt(totalDebit)}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1400px]">
                <thead>
                  <tr className="bg-[#FAF6EC] border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
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
                <tbody className="text-xs text-gray-700">
                  {rows.map((item, idx) => (
                    <tr
                      key={`${item.AuthLogin}-${item.TransDate2}-${idx}`}
                      className="border-b border-gray-100 hover:bg-[#FFF9E6]/40 transition-colors"
                    >
                      <td className="px-3 py-4 text-center font-medium border-r border-gray-100">
                        {item.RowNo ?? idx + 1}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 whitespace-nowrap font-mono">
                        {item.AuthLogin}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 font-medium text-gray-800 whitespace-nowrap">
                        {item.FullName}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 whitespace-nowrap">
                        {item.email}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 text-center font-bold text-green-700">
                        {item.Credit ? fmt(Number(item.Credit)) : "-"}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 text-center font-bold text-red-700">
                        {item.Debit ? fmt(Number(item.Debit)) : "-"}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-[#D4AF37]/20 text-gray-800">
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

            <div className="bg-white border-t border-gray-100 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Rows per page:</span>
                <select className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white">
                  <option>500</option>
                  <option>100</option>
                  <option>50</option>
                </select>
              </div>
              <div className="text-xs text-gray-600">
                Showing 1 to {rows.length} of {rows.length} entries
              </div>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#D4AF37] text-gray-900 hover:bg-[#B89328] transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#D4AF37] text-gray-900 text-xs font-bold">
                  1
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#D4AF37] text-gray-900 hover:bg-[#B89328] transition">
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