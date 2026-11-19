"use client";

import { proxyApiClient } from "@/spr-admin/lib/proxy-client";
import { isAxiosError } from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "sonner"; // 👈 Sonner import kiya

// 1. Exact API response type for Packages
interface PackageApiResponse {
  statusCode: number;
  message: string;
  data: {
    bindBuyPackage: {
      statuscode: number;
      message: string;
      Id: number;
      Remark: string;
    }[];
  };
}

// 2. Exact API response type for Submit Topup
interface TopupResponse {
  statusCode: number;
  message: string;
  data: {
    statusCode: number;
    message: string;
    RechargeId: string;
  }[];
}

export default function TopupUser() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [amount, setAmount] = useState("");

  // Package states
  const [packages, setPackages] = useState<PackageApiResponse["data"]["bindBuyPackage"]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | "">("");
  const [isFetchingPackages, setIsFetchingPackages] = useState(false);

  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Packages on Mount
  useEffect(() => {
    const fetchPackages = async () => {
      setIsFetchingPackages(true);
      try {
        const response = await proxyApiClient.post<PackageApiResponse>(
          "/proxy/WalletReport/getBindBuyPackageList"
        );
        const packageData = response?.data?.bindBuyPackage || [];
        setPackages(packageData);
      } catch (error) {
        console.error("Failed to fetch packages", error);
        toast.error("Failed to load packages. Please try again.");
      } finally {
        setIsFetchingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserId(value);

    // Demo verification hata diya — ab koi bhi User ID enter karo, form valid hoga
    if (value.trim() !== "") {
      setIsUserVerified(true);
      setUserName(""); // actual API lagne tak khali rakho
    } else {
      setIsUserVerified(false);
      setUserName("");
    }
  };
  const isFormValid =
    isUserVerified &&
    amount.trim() !== "" &&
    selectedPackageId !== "";

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);

    // Sonner loading toast (Promise handle karne ke liye best tarika)
    const submitPromise = new Promise(async (resolve, reject) => {
      try {
        const payload = {
          Authlogin: userId,
          PackageType: Number(selectedPackageId),
          USDTValue: Number(amount),
        };

        const response = await proxyApiClient.post<TopupResponse>(
          "/proxy/FundManager/addRechargeTransactionAdmin",
          payload
        );

        if (response?.statusCode === 200 || response?.data?.[0]?.statusCode === 1) {
          // Form reset
          setUserId("");
          setAmount("");
          setSelectedPackageId("");
          setUserName("");
          setIsUserVerified(false);

          resolve(response.message || "Successfully Bot Activated");
        } else {
          reject(new Error(response?.message || "Failed to activate bot"));
        }
      } catch (error: unknown) {
        const errorMsg = isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error
            ? error.message
            : "Something went wrong!";

        reject(new Error(errorMsg));
      } finally {
        setIsSubmitting(false);
      }
    });

    // Sonner ka smart toast (Automatically loading -> success/error me badal jata hai)
    toast.promise(submitPromise, {
      loading: "Activating bot...",
      success: (msg) => `${msg}`, // Jo resolve se aayega
      error: (err) => `${err.message}`, // Jo reject se aayega
    });
  };

  return (
    <div className="w-full min-h-screen font-sans transition-colors duration-300">
      <div className="mx-auto bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header Section */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Topup User</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter user and topup details below</p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <div className="bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6">
            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* 1. User ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Enter User ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={handleUserIdChange}
                    placeholder="Enter User ID"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all disabled:opacity-60"
                  />
                  {isUserVerified && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1 animate-in fade-in duration-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {userName}
                    </p>
                  )}
                </div>

                {/* 2. Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Enter Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter Amount"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all disabled:opacity-60"
                  />
                </div>

                {/* 3. Package Type (Dynamic Dropdown) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Package Type
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPackageId}
                      onChange={(e) => setSelectedPackageId(Number(e.target.value))}
                      disabled={isFetchingPackages || isSubmitting}
                      className="w-full appearance-none px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all disabled:opacity-50"
                    >
                      <option value="" disabled>
                        {isFetchingPackages ? "Loading packages..." : "Select Package"}
                      </option>
                      {packages.map((pkg) => (
                        <option key={pkg.Id} value={pkg.Id}>
                          {pkg.Remark}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  {!isUserVerified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 animate-in fade-in duration-300">
                      Please verify User ID first to avail packages
                    </p>
                  )}
                </div>

              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="submit"
                  disabled={!isFormValid || isFetchingPackages || isSubmitting}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}