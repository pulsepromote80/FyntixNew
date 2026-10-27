"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";

interface RouteMap {
  [key: string]: string;
}

interface DashboardData {
  data: Array<{
    MyAgent?: number;
    PerformanceWallet?: number;
    YieldWallet?: number;
    DepositWallet?: number;
    TotalTeam?: number;
    LegacyWallet?: number;
    PreviousAgent?: number;
    ActiveTeam?: number;
    YieldWithdrawal?: number;
    PerformanceWithdrawal?: number;
  }>;
}

function createRouteMapFromSeed(seed: string, count: number): RouteMap {
  return {
    "/buy-agent-license": "/buy-agent-license",
    "/deploy-agents": "/deploy-agents",
  };
}

const PAIR_CONFIG = [
  { pair: "EUR/USD", base: 1.0838, vol: 0.0004, decimals: 4 },
  { pair: "GBP/USD", base: 1.2632, vol: 0.0005, decimals: 4 },
  { pair: "USD/JPY", base: 151.29, vol: 0.05, decimals: 2 },
  { pair: "GOLD", base: 4294.51, vol: 0.8, decimals: 2 },
  { pair: "ETH/USDT", base: 2673.62, vol: 1.2, decimals: 2 },
];

export function Banner() {
  const router = useRouter();
  const { theme } = useTheme();

  const [getUserDashboardData] = useState<DashboardData>({
    data: [
      {
        MyAgent: 0,
        PerformanceWallet: 0,
        YieldWallet: 0,
        DepositWallet: 0,
        TotalTeam: 0,
        LegacyWallet: 0,
        PreviousAgent: 0,
        ActiveTeam: 0,
        YieldWithdrawal: 0,
        PerformanceWithdrawal: 0,
      },
    ],
  });

  const [routeMap, setRouteMap] = useState<RouteMap>({});

  useEffect(() => {
    const updateRouteMap = () => {
      const seed = Cookies.get("routeSlugsSeed");
      if (seed) {
        setRouteMap(createRouteMapFromSeed(seed, 6));
      } else {
        setRouteMap({});
      }
    };

    updateRouteMap();
    const interval = setInterval(updateRouteMap, 1000);
    return () => clearInterval(interval);
  }, []);

  // LIVE PAIRS
  const [pairsData, setPairsData] = useState(() =>
    PAIR_CONFIG.map((p) => ({
      pair: p.pair,
      price: p.base,
      prevPrice: p.base,
      change: 0,
      up: true,
      decimals: p.decimals,
    }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPairsData((prev) =>
        prev.map((item, i) => {
          const cfg = PAIR_CONFIG[i];
          if (!cfg) return item;
          const move = (Math.random() - 0.5) * cfg.vol * 2;
          const newPrice = item.price + move;
          const changePct = ((newPrice - cfg.base) / cfg.base) * 100;
          return {
            ...item,
            prevPrice: item.price,
            price: newPrice,
            change: changePct,
            up: newPrice >= item.price,
          };
        })
      );
    }, 1200);
    return () => clearInterval(id);
  }, []);

  // LIVE LINE CHART
  const POINTS = 60;
  const [data, setData] = useState<number[]>(() => {
    const arr: number[] = [];
    let val = 83376;
    for (let i = 0; i < POINTS; i++) {
      val += (Math.random() - 0.5) * 6;
      arr.push(val);
    }
    return arr;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        if (last === undefined) return prev;
        const next = last + (Math.random() - 0.5) * 6;
        return [...prev.slice(1), next];
      });
    }, 900);
    return () => clearInterval(id);
  }, []);

  const W = 400;
  const H = 140;
  const PAD_T = 8;
  const PAD_B = 8;
  const usableH = H - PAD_T - PAD_B;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (POINTS - 1)) * W;
    const y = PAD_T + usableH - ((v - min) / range) * usableH;
    return { x, y };
  });

  const buildSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";
    const first = points[0];
    if (!first) return "";
    let d = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      if (!p0 || !p1 || !p2 || !p3) continue;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(
        2
      )} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(pts);
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  const currentPrice = data[data.length - 1];
  const startPrice = data[0];
  const priceChange = currentPrice !== undefined && startPrice !== undefined ? currentPrice - startPrice : 0;
  const priceChangePct = startPrice !== undefined ? (priceChange / startPrice) * 100 : 0;
  const isUp = priceChange >= 0;

  const timeLabels = ["11:34 AM", "11:35 AM", "11:36 AM", "11:37 AM", "11:38 AM"];

  const yLabels = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const v = max - (range / 7) * i;
    return v.toFixed(0);
  });

  return (
    <div
      className="relative rounded-3xl overflow-hidden mb-4 grid grid-cols-1 lg:grid-cols-2 items-center gap-4 sm:gap-7 p-4 sm:p-6 lg:p-8"
      style={{
        background: theme === 'dark'
          ? "linear-gradient(120deg, #17130b 0%, #201a10 55%, #211b0d 100%)"
          : "linear-gradient(120deg, #fffbeb 0%, #fef3c7 55%, #fffbeb 100%)",
        border: theme === 'dark'
          ? "1px solid rgba(245, 196, 81, 0.25)"
          : "1px solid rgba(245, 196, 81, 0.4)",
      }}
    >
      {/* ================= LEFT SIDE ================= */}
      <div className="relative z-10">
        <div className={`inline-flex items-center gap-2 rounded-full font-semibold px-3.5 py-[7px] text-[11px] border mb-4 ${theme === 'dark'
            ? "bg-[rgba(245,196,81,.1)] border-[rgba(245,196,81,.35)] text-[#f5c451]"
            : "bg-[rgba(245,196,81,.15)] border-[rgba(245,196,81,.4)] text-[#a16207]"
          }`}>
          <span className="rounded-full w-[7px] h-[7px] bg-[#f5c451]" />
          Trade with AI-Assisted Risk Intelligence
        </div>

        <h1
          className={`font-bold text-[22px] sm:text-[26px] lg:text-[30px] leading-[1.2] mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Your financial command center, powered by{" "}
          <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            AI intelligence.
          </span>
        </h1>

        <p className={`text-xs sm:text-sm max-w-[440px] leading-[1.7] ${theme === 'dark' ? 'text-[#a8b5cc]' : 'text-gray-600'}`}>
          Learn smarter. Trade with intelligence. Track every rupee of progress
          and grow your wealth with strategies built for real market conditions.
        </p>

        <div className={`text-[10px] sm:text-[11px] mt-3.5 ${theme === 'dark' ? 'text-[#7a8699]' : 'text-gray-500'}`}>
          Figures shown are demo / historical placeholders and update once your
          live account is connected.
        </div>

        {/* Pair tiles */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-5">
          {pairsData.map((p) => (
            <div
              key={p.pair}
              className={`rounded-xl px-2.5 py-2 sm:px-3 sm:py-2 min-w-[85px] sm:min-w-[98px] border transition-colors duration-300 ${theme === 'dark'
                  ? "bg-white/[.04] border-white/10 hover:bg-white/[.07]"
                  : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
            >
              <div className={`text-[9.5px] sm:text-[10.5px] ${theme === 'dark' ? 'text-[#8a97ad]' : 'text-gray-500'}`}>{p.pair}</div>
              <div
                className={`font-semibold text-[11px] sm:text-[13px] mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                {p.price.toFixed(p.decimals)}
              </div>
              <div
                className={`text-[9.5px] sm:text-[10.5px] mt-0.5 transition-colors duration-300 ${p.change >= 0 ? "text-[#4ade9a]" : "text-[#ff8b96]"
                  }`}
              >
                {p.change >= 0 ? "+" : ""}
                {p.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ================= RIGHT SIDE — LIVE MARKET FEED ================= */}
      <div className={`relative z-10 rounded-2xl p-3 sm:p-[18px] backdrop-blur-sm border flex flex-col ${theme === 'dark'
          ? "bg-black/30 border-white/10"
          : "bg-white/80 border-gray-200"
        }`}>
        <div className={`flex justify-between text-[9px] sm:text-[10px] tracking-[.08em] mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <span>Live Market Feed</span>
          <b className="text-[#e0ac2e] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e0ac2e] animate-ping" />
            LIVE
          </b>
        </div>

        <div className="flex justify-between items-start mb-2">
          <div>
            <div
              className={`text-[16px] sm:text-[18px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              ${currentPrice !== undefined ? currentPrice.toFixed(2) : "0.00"}
            </div>
            <div
              className={`text-[10px] sm:text-[11px] ${isUp ? "text-[#4ade9a]" : "text-[#ff6b7d]"
                }`}
            >
              {isUp ? "+" : ""}
              {priceChange.toFixed(2)} ({priceChangePct.toFixed(2)}%)
            </div>
          </div>
          <div className={`text-[9px] sm:text-[10px] ${theme === 'dark' ? 'text-white/80' : 'text-gray-600'}`}>BTC/USDT</div>
        </div>

        {/* Chart + axes */}
        <div className="flex gap-2">
          {/* Y-axis labels */}
          <div
            className={`hidden sm:flex flex-col justify-between text-[9px] py-1 shrink-0 ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`}
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {yLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          {/* Chart */}
          <div className="flex-1 min-w-0">
            <div className="w-full h-[100px] sm:h-[130px] relative">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FB7185" />
                    <stop offset="100%" stopColor="#F43F5E" />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    x2={W}
                    y1={PAD_T + (usableH / 7) * i}
                    y2={PAD_T + (usableH / 7) * i}
                    stroke={theme === 'dark' ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                    strokeWidth="0.5"
                  />
                ))}

                <path d={areaPath} fill="url(#areaGrad)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {pts.length > 0 && (() => {
                  const lastPt = pts[pts.length - 1];
                  if (!lastPt) return null;
                  return (
                    <>
                      <circle
                        cx={lastPt.x}
                        cy={lastPt.y}
                        r="3.5"
                        fill="#F43F5E"
                      />
                      <circle
                        cx={lastPt.x}
                        cy={lastPt.y}
                        r="7"
                        fill="none"
                        stroke="#F43F5E"
                        strokeOpacity="0.4"
                        strokeWidth="1.5"
                      >
                        <animate
                          attributeName="r"
                          values="7;10;7"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="strokeOpacity"
                          values="0.4;0;0.4"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  );
                })()}
              </svg>
            </div>

            <div
              className={`flex justify-between text-[8px] sm:text-[9px] mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`}
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              {timeLabels.map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex justify-between mt-3 gap-2">
          <div className="text-center flex-1">
            <div
              className="font-semibold text-[13px] sm:text-[15px] text-[#4ade9a]"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Bearish
            </div>
            <div className={`text-[8.5px] sm:text-[9.5px] ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>TREND</div>
          </div>
          <div className="text-center flex-1">
            <div
              className={`font-semibold text-[13px] sm:text-[15px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              76%
            </div>
            <div className={`text-[8.5px] sm:text-[9.5px] ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>AI CONFIDENCE</div>
          </div>
          <div className="text-center flex-1">
            <div
              className="font-semibold text-[13px] sm:text-[15px] text-[#e0ac2e]"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Low
            </div>
            <div className={`text-[8.5px] sm:text-[9.5px] ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>RISK LEVEL</div>
          </div>
        </div>
      </div>
    </div>
  );
}