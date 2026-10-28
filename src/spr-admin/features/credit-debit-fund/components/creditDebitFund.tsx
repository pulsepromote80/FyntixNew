"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Scale,
  Wallet,
  User,
  Search,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Coins,
  BriefcaseBusiness,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  getUserWalletDetails,
  submitCreditDebit,
  type WalletDetails,
  type FundType,
  type FundTypeWiseCrDr,
  type CreditDebitPayload,
} from "../service/creditDebit.service";

export default function CreditDebitFund() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  const [wallet, setWallet] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // API data
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [fundTypes, setFundTypes] = useState<FundType[]>([]);
  const [crDrList, setCrDrList] = useState<FundTypeWiseCrDr[]>([]);

  // 👇 OTP flow
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingPayload, setPendingPayload] = useState<CreditDebitPayload | null>(null);

  // ============================================
  // 🔍 Mutation — Fetch wallet details
  // ============================================
  const walletMutation = useMutation({
    mutationFn: (loginId: string) => getUserWalletDetails(loginId),
    onSuccess: (res) => {
      const data = res.data;
      if (res.statusCode === 200 && data?.WalletDetails) {
        setWalletDetails(data.WalletDetails);
        setFundTypes(data.FundTypes ?? []);
        setCrDrList(data.FundTypeWiseCrDrList ?? []);
        setUserName(data.WalletDetails.Name ?? "");
        setIsVerified(true);
        setError("");
        toast.success("User found successfully!");
      } else {
        resetVerification();
        setError("User not found");
      }
    },
    onError: (err: unknown) => {
      const e = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        (status === 401 ? "Unauthorized. Please login again." : "User not found");
      resetVerification();
      setError(msg);
      toast.error(msg);
    },
  });

  // ============================================
  // 💾 Mutation — Final submit with OTP
  // ============================================
  const submitMutation = useMutation({
    mutationFn: (payload: CreditDebitPayload) => submitCreditDebit(payload),
    onSuccess: (res) => {
      if (res.statusCode === 200) {
        toast.success(res.message || "Transaction completed successfully!");
        handleFullReset();
      } else {
        toast.error(res.message || "Transaction failed");
      }
    },
    onError: (err: unknown) => {
      const e = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        (status === 401 ? "Unauthorized. Please login again." : "Failed to process transaction.");
      toast.error(msg);
    },
  });

  // ============================================
  // Helpers
  // ============================================
  const resetVerification = () => {
    setIsVerified(false);
    setUserName("");
    setWalletDetails(null);
    setFundTypes([]);
    setCrDrList([]);
  };

  const handleFullReset = () => {
    setUserId("");
    setUserName("");
    setIsVerified(false);
    setError("");
    setWallet("");
    setTransactionType("");
    setAmount("");
    setDescription("");
    setWalletDetails(null);
    setFundTypes([]);
    setCrDrList([]);
    setShowOtpForm(false);
    setOtp("");
    setPendingPayload(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = userId.trim();
    if (!trimmed) return;
    walletMutation.mutate(trimmed);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    if (isVerified) {
      resetVerification();
      setWallet("");
      setTransactionType("");
      setAmount("");
      setDescription("");
    }
    setError("");
  };

  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWallet(e.target.value);
    setTransactionType("");
  };

  // 👇 Step 1: Form submit → save data + open OTP form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified || !wallet || !transactionType || !amount || !description) {
      toast.error("Please fill all required fields!");
      return;
    }

    const payload: CreditDebitPayload = {
      Wallettype: wallet,
      CrDr: Number(transactionType),
      Authlogin: userId.trim(),
      Amt: Number(amount),
      Remark: description.trim(),
      CrdDbtOTP: "123456",
    };

    setPendingPayload(payload);
    setShowOtpForm(true);
    setOtp("");
  };

  // 👇 Step 2: OTP submit → call final API
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pendingPayload) return;
    if (!otp.trim() || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    submitMutation.mutate({
      ...pendingPayload,
      CrdDbtOTP: otp.trim(),
    });
  };

  // 👇 OTP form cancel
  const handleOtpCancel = () => {
    setShowOtpForm(false);
    setOtp("");
    setPendingPayload(null);
  };

  const isFormValid = isVerified && wallet && transactionType && amount && description;

  const isLoading = walletMutation.isPending;
  const isSubmitting = submitMutation.isPending;

  return (
    <div className="spr-admin-credit-debit-fund relative flex w-full items-start justify-center px-4 pb-4 pt-1 font-sans">
      <div className="flex w-full flex-col gap-4">
        {/* 1. Page Header */}

        <div className="flex items-center gap-3">
          {/* Icon — left */}
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Scale className="h-6 w-6" />
          </div>

          {/* Text — right, title upar, subtitle neeche */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Credit / Debit Fund</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Manage user wallet transactions efficiently
            </p>
          </div>
        </div>
        {/* 2. Main Card */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Wallet className="h-5 w-5" />
              Transaction Details
            </h2>
            <p className="mt-1 text-xs text-white/90">
              Fill in the details to credit or debit funds
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Row 1 */}
              <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <User className="h-3.5 w-3.5 text-blue-600" /> User ID *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userId}
                      onChange={handleUserIdChange}
                      placeholder="Enter user ID"
                      className={`flex-1 rounded-lg border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={!userId.trim() || isLoading}
                      className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
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
                  </div>
                  {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                    <User className="h-3.5 w-3.5 text-blue-600" /> User Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={isLoading ? "Loading..." : userName}
                    placeholder="User name will appear here"
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
                  />
                </div>
              </div>

              {/* After verification */}
              {isVerified && walletDetails && (
                <div className="animate-in fade-in slide-in-from-top-3 duration-300">
                  {/* Wallet Cards */}
                  <div className="mb-5">
                    <label className="mb-2 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                      <Wallet className="h-3.5 w-3.5 text-blue-600" /> Current Wallet Balances
                    </label>
                    <div className="spr-admin-wallet-balances grid grid-cols-1 gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-100">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-500">
                            Income Wallet
                          </p>
                          <p className="text-sm font-bold text-green-700">
                            ${Number(walletDetails.IncomeWallet ?? 0).toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-500">
                            Deposit Wallet
                          </p>
                          <p className="text-sm font-bold text-blue-700">
                            ${Number(walletDetails.DepositWallet ?? 0).toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-100">
                          <Coins className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-500">
                            Fund Wallet
                          </p>
                          <p className="text-sm font-bold text-orange-700">
                            ${Number(walletDetails.FundWallet ?? 0).toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-100">
                          <BriefcaseBusiness className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-500">
                            Mentor Wallet
                          </p>
                          <p className="text-sm font-bold text-purple-700">
                            ${Number(walletDetails.MentorWallet ?? 0).toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Select Wallet + Transaction Type */}
                  <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                        <Wallet className="h-3.5 w-3.5 text-blue-600" /> Select Wallet *
                      </label>
                      <div className="relative">
                        <select
                          value={wallet}
                          onChange={handleWalletChange}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" disabled>
                            -- Select Wallet --
                          </option>

                          {fundTypes.length > 0 ? (
                            fundTypes.map((f, idx) => (
                              <option key={f.Id ?? idx} value={f.Ftype}>
                                {f.Type}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="pp@ww">Income Wallet</option>
                              <option value="dw@d">Deposit Wallet</option>
                              <option value="wY$ro">Trading Wallet</option>
                            </>
                          )}
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
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                        <Scale className="h-3.5 w-3.5 text-blue-600" /> Transaction Type *
                      </label>
                      <div className="relative">
                        <select
                          value={transactionType}
                          onChange={(e) => setTransactionType(e.target.value)}
                          disabled={!wallet}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="" disabled>
                            -- Select Type --
                          </option>
                          {crDrList.length > 0 ? (
                            crDrList.map((c) => (
                              <option key={c.Id} value={c.CrDr}>
                                {c.Type}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="1">Credit</option>
                              <option value="2">Debit</option>
                            </>
                          )}
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
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="mb-5">
                    <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                      <DollarSign className="h-3.5 w-3.5 text-blue-600" /> Enter Amount *
                    </label>
                    <input
                      type="number"
                      value={amount}
                      min="1"
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={!transactionType}
                      placeholder="Enter amount"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                    <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500">
                      <Wallet className="h-3.5 w-3.5 text-blue-600" /> Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={!transactionType}
                      placeholder="Enter transaction description"
                      rows={4}
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  <ArrowRight className="h-4 w-4" />
                  Submit Transaction
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Important Info */}
        <div className="spr-admin-credit-debit-info flex w-full gap-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div className="mt-0.5 shrink-0 rounded-full bg-blue-100 p-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="mb-1.5 text-sm font-bold text-gray-800">Important Information</h4>
            <ul className="list-inside list-disc space-y-1 text-xs text-gray-700">
              <li>Please ensure the user ID is valid before proceeding</li>
              <li>Debit transactions cannot exceed the current wallet balance</li>
              <li>All transactions are recorded for audit purposes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ============================================
          🔐 OTP MODAL
          ============================================ */}
      {showOtpForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl duration-200">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-white" />
                <h2 className="text-lg font-bold text-white">OTP Verification</h2>
              </div>
              <button
                type="button"
                onClick={handleOtpCancel}
                disabled={isSubmitting}
                className="text-white/90 transition hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleOtpSubmit}>
              <div className="p-6">
                <p className="mb-4 text-sm text-gray-600">
                  Enter the OTP sent to your registered email/mobile to confirm this transaction.
                </p>

                {/* Summary */}
                {pendingPayload && (
                  <div className="spr-admin-otp-summary mb-4 space-y-1 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">User ID:</span>
                      <span className="font-bold text-gray-800">{pendingPayload.Authlogin}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-gray-500">Wallet:</span>
                      <span className="font-bold text-gray-800">{pendingPayload.Wallettype}</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-bold text-gray-800">
                        {crDrList.find((c) => c.CrDr === pendingPayload.CrDr)?.Type ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-bold text-gray-800">${pendingPayload.Amt}</span>
                    </div>
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">
                    Enter OTP *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    placeholder="• • • • • •"
                    autoFocus
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <p className="mt-1.5 text-center text-[10px] text-gray-400">
                    OTP is valid for 5 minutes
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 pb-6">
                <button
                  type="button"
                  onClick={handleOtpCancel}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!otp.trim() || otp.length < 4 || isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Verify & Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
