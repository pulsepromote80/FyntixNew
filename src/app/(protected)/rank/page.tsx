"use client";

import { useEffect, useState } from "react";
import { Zap, Info, TrendingUp, TrendingDown, Loader2, Award } from "lucide-react";

type RankRow = {
  RewardTitle: string;
  RequiredBusiness: string;
  Amount: string;
  Statusx: string;
  LeftBuss: number;
  RightBuss: number;
  PendingLeft: number;
  PendingRight: number;
};

type ApiResponse = {
  statusCode: number;
  message: string;
  data: RankRow[];
};

interface RankData {
  ranks?: RankRow[];
}

export default function RankPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rankData, setRankData] = useState<RankData>({});

  useEffect(() => {
    loadRankData();
  }, []);

  const loadRankData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/wallet-manager/rank", {
        method: "GET",
        cache: "no-store",
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load rank data");
      }

      const rows = getRows(payload);
      setRankData({
        ranks: rows,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load rank data.");
    } finally {
      setLoading(false);
    }
  };

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  function isRankRow(value: unknown): value is RankRow {
    return isRecord(value) && typeof value.RewardTitle === "string";
  }

  function isApiResponse(value: unknown): value is ApiResponse {
    return isRecord(value) && typeof value.statusCode === "number" && Array.isArray(value.data);
  }

  function getRows(payload: unknown): RankRow[] {
    if (Array.isArray(payload)) return payload.filter(isRankRow);

    if (isApiResponse(payload) && payload.statusCode === 200) {
      return payload.data;
    }

    const pending: unknown[] = [payload];
    const visited = new Set<object>();
    for (let depth = 0; depth < 7 && pending.length > 0; depth += 1) {
      const level = pending.splice(0);
      for (const value of level) {
        if (Array.isArray(value)) {
          const records = value.filter(isRankRow);
          if (records.length > 0) return records;
          pending.push(...value);
          continue;
        }
        if (!isRecord(value) || visited.has(value)) continue;
        visited.add(value);
        pending.push(...Object.values(value));
      }
    }
    return [];
  }

  function formatMoney(value: unknown): string {
    if (typeof value === "string") {
      // If it already has $ symbol, return as is
      if (value.startsWith("$")) {
        return value;
      }
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
    const num = Number(value);
    if (Number.isFinite(num)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(num);
    }
    return "$0.00";
  }

  function formatBusinessVolume(value: unknown): string {
    if (typeof value === "string") {
      const cleaned = value.replace(/,/g, "");
      const num = Number(cleaned);
      if (!Number.isNaN(num)) {
        return new Intl.NumberFormat("en-US").format(num);
      }
      return value;
    }
    const num = Number(value);
    if (Number.isFinite(num)) {
      return new Intl.NumberFormat("en-US").format(num);
    }
    return "0";
  }

  const ranks = rankData.ranks ?? [];

  const achievedRank = ranks
    .filter((r) => r.Statusx === "Qualify")
    .sort((a, b) => {
      const aReq = Number(a.RequiredBusiness.replace(/,/g, "")) || 0;
      const bReq = Number(b.RequiredBusiness.replace(/,/g, "")) || 0;
      return bReq - aReq;
    })[0]?.RewardTitle || "N/A";

  const nextRank = ranks
    .filter((r) => r.Statusx === "Not Qualify")
    .sort((a, b) => {
      const aReq = Number(a.RequiredBusiness.replace(/,/g, "")) || 0;
      const bReq = Number(b.RequiredBusiness.replace(/,/g, "")) || 0;
      return aReq - bReq; 
    })[0]?.RewardTitle || "N/A";

  // Use the first rank's business data for display
  const firstRank = ranks[0];
  const powerTeamBusiness = firstRank?.LeftBuss || 0;
  const weakerTeamBusiness = firstRank?.RightBuss || 0;
  const pendingPowerTeamBusiness = firstRank?.PendingLeft || 0;
  const pendingWeakerTeamBusiness = firstRank?.PendingRight || 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300">
            <Award className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Rank Progress</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track your rank achievements and rewards.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div
          className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
          role="alert"
        >
          <div className="flex flex-wrap justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => loadRankData()}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!error && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Achieved Rank
                </span>
                <Zap className="h-4 w-4 text-yellow-500" aria-hidden />
              </div>
              <div className="px-4 py-4">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{achievedRank}</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Next Rank
                </span>
                <Info className="h-4 w-4 text-blue-500" aria-hidden />
              </div>
              <div className="px-4 py-4">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{nextRank}</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Left Buss / Right Buss
                </span>
                <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden />
              </div>
              <div className="px-4 py-4">
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {formatMoney(powerTeamBusiness)} / {formatMoney(weakerTeamBusiness)}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Pending Left / Pending Right
                </span>
                <TrendingDown className="h-4 w-4 text-amber-500" aria-hidden />
              </div>
              <div className="px-4 py-4">
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {formatMoney(pendingPowerTeamBusiness)} / {formatMoney(pendingWeakerTeamBusiness)}
                </p>
              </div>
            </div>
          </div>

          <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Rank Table</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {ranks.length} rank{ranks.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-blue-50/80 text-xs uppercase tracking-wider text-slate-600 dark:bg-blue-900/20 dark:text-slate-300">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">#</th>
                    <th className="whitespace-nowrap px-4 py-3">TITLE</th>
                    <th className="whitespace-nowrap px-4 py-3">BUSINESS VOLUME</th>
                    <th className="whitespace-nowrap px-4 py-3">REWARD</th>
                    <th className="whitespace-nowrap px-4 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#F5C451]" aria-label="Loading" />
                      </td>
                    </tr>
                  ) : ranks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                        No rank data found.
                      </td>
                    </tr>
                  ) : (
                    ranks.map((row, index) => {
                      const status = row.Statusx.toLowerCase();
                      const isQualified = status === "qualify" || status === "qualified";
                      return (
                        <tr
                          key={`${row.RewardTitle}-${index}`}
                          className="text-slate-700 transition-colors hover:bg-blue-50/50 dark:text-slate-200 dark:hover:bg-blue-900/10"
                        >
                          <td className="whitespace-nowrap px-4 py-3">{index + 1}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-semibold">
                            {row.RewardTitle}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {formatBusinessVolume(row.RequiredBusiness)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {row.Amount}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                                isQualified
                                  ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-300"
                              }`}
                            >
                              {row.Statusx}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
