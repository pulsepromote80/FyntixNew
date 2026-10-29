"use client";

import { CircleDollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { formatCurrency } from "@/lib/utils";

export function GlobalInfrastructure() {
  const { data } = useDashboardSummary();
  const dashboardData = data?.data?.[0];
  const programs = [
    { name: "Liquidity Provider", key: "TradingPackage" },
    { name: "Smart Bonds", key: "SmartBondPack" },
    { name: "Secure Bonds", key: "SecureBondPack" },
    { name: "Booster", key: "BoosterPackage" },
    { name: "Performance Rank", key: "UserRank" },
    { name: "Yield Per", key: "YieldPer" },
  ] as const;

  return (
    <div className="mt-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
          <TrendingUp className="h-5 w-5 text-[#1680ff]" aria-hidden />
        </div>
        <div>
          <h2 className="text-lg text-gray-900 dark:text-white md:text-xl">Executing Trades</h2>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Your live self-trading position.
          </p>
        </div>
      </div>

      <section className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#1E293B] dark:bg-[#0b0b0e] sm:p-6">
        <div className="grid grid-cols-[1.8fr_0.8fr_0.9fr] items-center border-b border-gray-200 pb-4 text-gray-500 dark:border-[#1E293B] dark:text-gray-400">
          <div className="text-[12px] font-semibold uppercase tracking-[0.11em] sm:text-sm">PROGRAM</div>
          <div className="text-center text-[12px] font-semibold uppercase tracking-[0.11em] sm:text-sm">STATUS</div>
          <div className="text-right text-[12px] font-semibold uppercase tracking-[0.11em] sm:text-sm">AMOUNT</div>
        </div>

        {programs.map((program) => {
          const value = dashboardData?.[program.key] ?? 0;
          const isStringActive = typeof value === "string" && value === "Active";
          const isNotAvailable = typeof value === "string" && value === "N/A";
          const numericAmount = typeof value === "number" ? value : 0;
          const isActive = isStringActive || numericAmount > 0;

          return (
            <div
              key={program.key}
              className="grid grid-cols-[1.8fr_0.8fr_0.9fr] items-center border-b border-gray-200 py-5 text-gray-900 last:border-b-0 dark:border-[#1E293B] dark:text-white"
            >
              <div className="text-[12px] font-semibold leading-snug ">{program.name}</div>
              <div className="flex justify-center">
                {isNotAvailable ? (
                  <span
                    aria-label="Not Available"
                    className="text-2xl font-bold leading-none text-red-500"
                  >
                    ✕
                  </span>
                ) : (
                  <span
                    aria-label={isActive ? "Active" : "Inactive"}
                    className={`text-2xl font-bold leading-none ${isActive ? "text-green-500" : "text-red-500"}`}
                  >
                    {isActive ? "✓" : "✕"}
                  </span>
                )}
              </div>
              <div className="text-right font-bold ">
                {isNotAvailable ? "N/A" : isStringActive ? "Active" : program.key === "YieldPer" ? `${numericAmount}%` : formatCurrency(numericAmount)}
              </div>
            </div>
          );
        })}

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href="/fund-director"
            aria-label="Go to Self Deposit"
            className="block w-full max-w-[560px] rounded-2xl border border-gray-200 bg-gray-50 px-5 py-7 text-center transition-colors hover:border-[#25c6e8] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1680ff] dark:border-[#1E293B] dark:bg-[#0b0b0e] dark:hover:border-cyan-700 dark:hover:bg-blue-950/30 sm:px-8 sm:py-8"
          >
            <div className="mx-auto mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-xl bg-gradient-to-br from-[#1680ff] via-[#25c6e8] to-[#7d75ff] text-white shadow-[0_10px_22px_rgba(22,128,255,0.2)] sm:mb-5 sm:h-[76px] sm:w-[76px]">
              <CircleDollarSign aria-hidden="true" className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2.2} />
            </div>

            <h3 className="text-2xl font-semibold tracking-[-0.02em] text-gray-900 dark:text-white sm:text-[28px]">
              Deposit
            </h3>

            <p className="mx-auto mt-2 max-w-[460px] text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
              Trade smarter with a strategy designed to optimize your potential returns.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
