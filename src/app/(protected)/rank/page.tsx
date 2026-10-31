"use client";

import { useEffect, useState } from "react";
import { Zap, Info, TrendingUp, TrendingDown, Loader2, Award, Coins, Users } from "lucide-react";

type RankRow = {
  RewardTitle: string;
  RewardAchvd: string;
  RequiredBusiness: string;
  Amount: string;
  Statusx: string;
  PowerTeamBusines: number;
  WeakerTeamBusines: number;
  PendingPowerTeam: number;
  PendingWeakerTeam: number;
  NextReleaseDate: string;
};

type UnityRow = {
  RequiredBusiness: string;
  TotalDiffPer: string;
  Statusx: string;
  RankAchvd: string;
  StrongTeamID: string;
  PowerTeamBusines: number;
  WeakerTeamBusines: number;
  PendingPowerTeam: number;
  PendingWeakerTeam: number;
};

type DAORow = {
  PoolName: string;
  MatchingBusiness: number;
  NoofShares: number;
  DAOReward: number;
  Statusx: string;
};

type ApiResponse = {
  statusCode: number;
  message: string;
  data: RankRow[];
};

type UnityApiResponse = {
  statusCode: number;
  message: string;
  data: UnityRow[];
};

type DAOApiResponse = {
  statusCode: number;
  message: string;
  data: DAORow[];
};

interface RankData {
  ranks?: RankRow[];
}

interface UnityData {
  unity?: UnityRow[];
}

interface DAOData {
  dao?: DAORow[];
}

export default function RankPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rankData, setRankData] = useState<RankData>({});
  const [unityLoading, setUnityLoading] = useState(false);
  const [unityError, setUnityError] = useState("");
  const [unityData, setUnityData] = useState<UnityData>({});
  const [daoLoading, setDaoLoading] = useState(false);
  const [daoError, setDaoError] = useState("");
  const [daoData, setDaoData] = useState<DAOData>({});
  const [activeTab, setActiveTab] = useState<"rank" | "unity" | "dao">("rank");

  useEffect(() => {
    loadRankData();
  }, []);

  useEffect(() => {
    if (activeTab === "unity") {
      loadUnityData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "dao") {
      loadDaoData();
    }
  }, [activeTab]);

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

  const loadUnityData = async () => {
    setUnityLoading(true);
    setUnityError("");
    try {
      const response = await fetch("/api/wallet-manager/unity", {
        method: "POST",
        cache: "no-store",
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load unity revenue data");
      }

      const rows = getUnityRows(payload);
      setUnityData({
        unity: rows,
      });
    } catch (requestError) {
      setUnityError(requestError instanceof Error ? requestError.message : "Could not load unity revenue data.");
    } finally {
      setUnityLoading(false);
    }
  };

  const loadDaoData = async () => {
    setDaoLoading(true);
    setDaoError("");
    try {
      const response = await fetch("/api/wallet-manager/dao", {
        method: "POST",
        cache: "no-store",
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load DAO data");
      }

      const rows = getDaoRows(payload);
      setDaoData({
        dao: rows,
      });
    } catch (requestError) {
      setDaoError(requestError instanceof Error ? requestError.message : "Could not load DAO data.");
    } finally {
      setDaoLoading(false);
    }
  };

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  function isRankRow(value: unknown): value is RankRow {
    return isRecord(value) && typeof value.RewardTitle === "string";
  }

  function isUnityRow(value: unknown): value is UnityRow {
    return isRecord(value) && typeof value.RequiredBusiness === "string";
  }

  function isDAORow(value: unknown): value is DAORow {
    return isRecord(value) && typeof value.PoolName === "string";
  }

  function isApiResponse(value: unknown): value is ApiResponse {
    return isRecord(value) && typeof value.statusCode === "number" && Array.isArray(value.data);
  }

  function isUnityApiResponse(value: unknown): value is UnityApiResponse {
    return isRecord(value) && typeof value.statusCode === "number" && Array.isArray(value.data);
  }

  function isDAOApiResponse(value: unknown): value is DAOApiResponse {
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

  function getUnityRows(payload: unknown): UnityRow[] {
    if (Array.isArray(payload)) return payload.filter(isUnityRow);

    if (isUnityApiResponse(payload) && payload.statusCode === 200) {
      return payload.data;
    }

    const pending: unknown[] = [payload];
    const visited = new Set<object>();
    for (let depth = 0; depth < 7 && pending.length > 0; depth += 1) {
      const level = pending.splice(0);
      for (const value of level) {
        if (Array.isArray(value)) {
          const records = value.filter(isUnityRow);
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

  function getDaoRows(payload: unknown): DAORow[] {
    if (Array.isArray(payload)) return payload.filter(isDAORow);

    if (isDAOApiResponse(payload) && payload.statusCode === 200) {
      return payload.data;
    }

    const pending: unknown[] = [payload];
    const visited = new Set<object>();
    for (let depth = 0; depth < 7 && pending.length > 0; depth += 1) {
      const level = pending.splice(0);
      for (const value of level) {
        if (Array.isArray(value)) {
          const records = value.filter(isDAORow);
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
  const unity = unityData.unity ?? [];
  const dao = daoData.dao ?? [];

  const achievedRank = ranks
    .filter((r) => r.Statusx === "Qualify")
    .sort((a, b) => {
      const aReq = Number(a.RequiredBusiness.replace(/,/g, "")) || 0;
      const bReq = Number(b.RequiredBusiness.replace(/,/g, "")) || 0;
      return bReq - aReq;
    })[0]?.RewardAchvd || "N/A";

  // Use the first rank's business data for display
  const firstRank = ranks[0];
  const powerTeamBusiness = firstRank?.PowerTeamBusines || 0;
  const weakerTeamBusiness = firstRank?.WeakerTeamBusines || 0;
  const pendingPowerTeamBusiness = firstRank?.PendingPowerTeam || 0;
  const pendingWeakerTeamBusiness = firstRank?.PendingWeakerTeam || 0;
  const nextReleaseDate = firstRank?.NextReleaseDate || "N/A";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff]" />
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#1680ff] dark:bg-cyan-400/10 dark:text-[#25c6e8]">
            <Award className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Rewards & Progress</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track your achievements and progress.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveTab("rank")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "rank"
              ? "bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff] text-white shadow-lg"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          <Award className="h-4 w-4" />
          Rank Progress
        </button>
        <button
          onClick={() => setActiveTab("unity")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "unity"
              ? "bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff] text-white shadow-lg"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          <Coins className="h-4 w-4" />
          Unity Revenue Yield
        </button>
        <button
          onClick={() => setActiveTab("dao")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "dao"
              ? "bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff] text-white shadow-lg"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          <Users className="h-4 w-4" />
          DAO Program
        </button>
      </div>

      {/* Rank Progress Tab */}
      {activeTab === "rank" && (
        <>
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
                    <Zap className="h-4 w-4 text-[#1680ff] dark:text-[#25c6e8]" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{achievedRank}</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Next Release Date
                    </span>
                    <Info className="h-4 w-4 text-blue-500" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{nextReleaseDate}</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Power Team / Weaker Team Business
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
                      Pending Power / Weaker Team Business
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
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff]" />
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
                    <thead className="bg-gradient-to-r from-blue-50/80 via-cyan-50/60 to-violet-50/80 text-xs uppercase tracking-wider text-slate-600 dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-violet-900/20 dark:text-slate-300">
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
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1680ff]" aria-label="Loading" />
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
                              className="text-slate-700 transition-colors hover:bg-blue-50/50 dark:text-slate-200 dark:hover:bg-cyan-900/10"
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
        </>
      )}

      {/* Unity Revenue Yield Tab */}
      {activeTab === "unity" && (
        <>
          {unityError && (
            <div
              className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              role="alert"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <span>{unityError}</span>
                <button
                  type="button"
                  onClick={() => loadUnityData()}
                  className="font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!unityError && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Power Team Business
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {formatMoney(unity[0]?.PowerTeamBusines || 0)}
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Weaker Team Business
                    </span>
                    <TrendingDown className="h-4 w-4 text-amber-500" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {formatMoney(unity[0]?.WeakerTeamBusines || 0)}
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Strong Team ID
                    </span>
                    <Info className="h-4 w-4 text-blue-500" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {unity[0]?.StrongTeamID || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Yield
                    </span>
                    <Zap className="h-4 w-4 text-[#1680ff] dark:text-[#25c6e8]" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {unity[0]?.RankAchvd || "N/A"}%
                    </p>
                  </div>
                </div>
              </div>

              <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff]" />
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">Unity Revenue Table</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {unity.length} level{unity.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gradient-to-r from-blue-50/80 via-cyan-50/60 to-violet-50/80 text-xs uppercase tracking-wider text-slate-600 dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-violet-900/20 dark:text-slate-300">
                      <tr>
                        <th className="whitespace-nowrap px-4 py-3">#</th>
                        <th className="whitespace-nowrap px-4 py-3">REQUIRED BUSINESS</th>
                        <th className="whitespace-nowrap px-4 py-3">YIELD %</th>
                        <th className="whitespace-nowrap px-4 py-3">POWER TEAM</th>
                        <th className="whitespace-nowrap px-4 py-3">WEAKER TEAM</th>
                        <th className="whitespace-nowrap px-4 py-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {unityLoading ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1680ff]" aria-label="Loading" />
                          </td>
                        </tr>
                      ) : unity.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                            No unity revenue data found.
                          </td>
                        </tr>
                      ) : (
                        unity.map((row, index) => {
                          const status = row.Statusx.toLowerCase();
                          const isQualified = status === "qualify" || status === "qualified";
                          return (
                            <tr
                              key={`${row.RequiredBusiness}-${index}`}
                              className="text-slate-700 transition-colors hover:bg-blue-50/50 dark:text-slate-200 dark:hover:bg-cyan-900/10"
                            >
                              <td className="whitespace-nowrap px-4 py-3">{index + 1}</td>
                              <td className="whitespace-nowrap px-4 py-3 font-semibold">
                                {row.RequiredBusiness}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                {row.TotalDiffPer}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                {formatMoney(row.PowerTeamBusines)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                {formatMoney(row.WeakerTeamBusines)}
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
        </>
      )}

      {/* DAO Program Tab */}
      {activeTab === "dao" && (
        <>
          {daoError && (
            <div
              className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              role="alert"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <span>{daoError}</span>
                <button
                  type="button"
                  onClick={() => loadDaoData()}
                  className="font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!daoError && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Total Pools
                    </span>
                    <Coins className="h-4 w-4 text-[#1680ff] dark:text-[#25c6e8]" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{dao.length}</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Total Shares
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {dao.reduce((sum, row) => sum + row.NoofShares, 0)}
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Total DAO Reward
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {formatMoney(dao.reduce((sum, row) => sum + row.DAOReward, 0))}
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Qualified Pools
                    </span>
                    <Zap className="h-4 w-4 text-[#1680ff] dark:text-[#25c6e8]" aria-hidden />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {dao.filter((row) => row.Statusx === "Qualify").length}
                    </p>
                  </div>
                </div>
              </div>

              <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/75">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff]" />
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">DAO Reward Table</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {dao.length} pool{dao.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gradient-to-r from-blue-50/80 via-cyan-50/60 to-violet-50/80 text-xs uppercase tracking-wider text-slate-600 dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-violet-900/20 dark:text-slate-300">
                      <tr>
                        <th className="whitespace-nowrap px-4 py-3">#</th>
                        <th className="whitespace-nowrap px-4 py-3">POOL NAME</th>
                        <th className="whitespace-nowrap px-4 py-3">MATCHING BUSINESS</th>
                        <th className="whitespace-nowrap px-4 py-3">NO. OF SHARES</th>
                        <th className="whitespace-nowrap px-4 py-3">DAO REWARD</th>
                        <th className="whitespace-nowrap px-4 py-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {daoLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1680ff]" aria-label="Loading" />
                          </td>
                        </tr>
                      ) : dao.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                            No DAO data found.
                          </td>
                        </tr>
                      ) : (
                        dao.map((row, index) => {
                          const status = row.Statusx.toLowerCase();
                          const isQualified = status === "qualify" || status === "qualified";
                          return (
                            <tr
                              key={`${row.PoolName}-${index}`}
                              className="text-slate-700 transition-colors hover:bg-blue-50/50 dark:text-slate-200 dark:hover:bg-cyan-900/10"
                            >
                              <td className="whitespace-nowrap px-4 py-3">{index + 1}</td>
                              <td className="whitespace-nowrap px-4 py-3 font-semibold">
                                {row.PoolName}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                {formatMoney(row.MatchingBusiness)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                {row.NoofShares}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                {formatMoney(row.DAOReward)}
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
        </>
      )}
    </div>
  );
}
