"use client";

import { useState, useEffect } from "react";

interface ExecutionRow {
  time: string;
  chain: string;
  route: string;
  pair: string;
  tx: string;
  amount: number;
  spread: number;
  latency: number;
}

const GOLD_COLOR = "#f5c451";

export default function AnalyticsPage() {
  const [opsValue, setOpsValue] = useState(1716);
  const [spreadValue, setSpreadValue] = useState(0.308);
  const [execsValue, setExecsValue] = useState(16850);
  const [routedValue, setRoutedValue] = useState(2700225);
  const [fillsValue, setFillsValue] = useState(91);
  const [reserveValue, setReserveValue] = useState(1.49);
  const [p50, setP50] = useState(68);
  const [p95, setP95] = useState(132);

  const [activeChain, setActiveChain] = useState("ALL");
  const [streamRows, setStreamRows] = useState<ExecutionRow[]>([
    {
      time: "12:49:11",
      chain: "BSC",
      route: "Wombat → THENA",
      pair: "BNB/USDT",
      tx: "0xe7bcb…4703",
      amount: 7296,
      spread: 24,
      latency: 202,
    },
    {
      time: "12:49:08",
      chain: "BASE",
      route: "Aerodrome → BaseSwap",
      pair: "ETH/USDC",
      tx: "0x63484…fe1a",
      amount: 9342,
      spread: 35,
      latency: 285,
    },
    {
      time: "12:49:05",
      chain: "BSC",
      route: "PancakeSwap → Biswap",
      pair: "BNB/USDT",
      tx: "0xc4448…1a46",
      amount: 7442,
      spread: 65,
      latency: 54,
    },
    {
      time: "12:49:03",
      chain: "BSC",
      route: "PancakeSwap → Biswap",
      pair: "BNB/USDT",
      tx: "0xc9e8f…8d42",
      amount: 7962,
      spread: 39,
      latency: 420,
    },
    {
      time: "12:49:00",
      chain: "AVAX",
      route: "Pangolin → Trader Joe",
      pair: "AVAX/USDT",
      tx: "0x53f72…5e4b",
      amount: 6202,
      spread: 9,
      latency: 316,
    },
    {
      time: "12:48:58",
      chain: "BASE",
      route: "Uniswap v3 → Aerodrome",
      pair: "ETH/USDC",
      tx: "0x18b84…b81b",
      amount: 8930,
      spread: 44,
      latency: 272,
    },
    {
      time: "12:48:55",
      chain: "BSC",
      route: "Wombat → THENA",
      pair: "BNB/USDT",
      tx: "0x38dc6…15a0",
      amount: 8299,
      spread: 38,
      latency: 360,
    },
    {
      time: "12:48:52",
      chain: "BSC",
      route: "Wombat → THENA",
      pair: "BNB/USDT",
      tx: "0xb6926…a578",
      amount: 8878,
      spread: 44,
      latency: 357,
    },
  ]);

  const chains = [
    { name: "ALL", count: 60 },
    { name: "AVAX", count: 9 },
    { name: "ETH", count: 8 },
    { name: "SOL", count: 8 },
    { name: "BSC", count: 15 },
    { name: "ARB", count: 8 },
    { name: "BASE", count: 12 },
  ];

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOpsValue((prev) => Math.max(1500, Math.min(1800, prev + (Math.random() - 0.5) * 50)));
      setSpreadValue((prev) => Math.max(0.2, Math.min(0.4, prev + (Math.random() - 0.5) * 0.02)));
      setExecsValue((prev) => prev + Math.floor(Math.random() * 10));
      setRoutedValue((prev) => prev + Math.floor(Math.random() * 50000));
      setFillsValue((prev) => Math.max(80, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setReserveValue((prev) => Math.max(1.4, Math.min(1.6, prev + (Math.random() - 0.5) * 0.01)));
      setP50((prev) => Math.max(50, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setP95((prev) => Math.max(100, Math.min(180, prev + (Math.random() - 0.5) * 15)));

      // Add new execution row
      const chainIndex = Math.floor(Math.random() * (chains.length - 1)) + 1;
      const newChain = chains[chainIndex]?.name ?? "BSC";
      const routes = [
        "Wombat → THENA",
        "Aerodrome → BaseSwap",
        "PancakeSwap → Biswap",
        "Pangolin → Trader Joe",
        "Uniswap v3 → Aerodrome",
        "Orca → Raydium",
      ];
      const pairs = ["BNB/USDT", "ETH/USDC", "AVAX/USDT", "SOL/USDC", "ARB/ETH"];
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      const newRow: ExecutionRow = {
        time,
        chain: newChain,
        route: routes[Math.floor(Math.random() * routes.length)]!,
        pair: pairs[Math.floor(Math.random() * pairs.length)]!,
        tx: `0x${Math.random().toString(16).substr(2, 4)}…${Math.random().toString(16).substr(2, 4)}`,
        amount: Math.floor(Math.random() * 5000) + 5000,
        spread: Math.floor(Math.random() * 50) + 10,
        latency: Math.floor(Math.random() * 400) + 50,
      };

      setStreamRows((prev) => [newRow, ...prev].slice(0, 8));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredRows = activeChain === "ALL" ? streamRows : streamRows.filter((row) => row.chain === activeChain);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: GOLD_COLOR }}></span>
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: GOLD_COLOR }}></span>
          </span>
          <span className="text-xs font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
            HYPERGEN ENGINE
          </span>
        </div>
        <div className="text-xs font-mono text-gray-400">12 CHAINS · 38 VENUES · ONE ORDER BOOK</div>
      </header>

      {/* Main Stats Card */}
      <div className="card p-6 mb-4 bg-white dark:bg-[#0B1021] border border-gray-200 dark:border-[#1E293B] rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* OPS / MIN */}
          <div>
            <div className="text-[11px] font-medium text-gray-400 tracking-wide mb-3">OPS / MIN</div>
            <div className="font-mono text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {Math.round(opsValue).toLocaleString()}
            </div>
            <div className="mt-3">
              <div style={{ width: "220px", height: "120px", position: "relative", overflow: "hidden" }}>
                <div
                  style={{
                    width: "220px",
                    height: "220px",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    background: `conic-gradient(from -125deg, ${GOLD_COLOR} 0deg ${(opsValue / 1800) * 250}deg, #e5e7eb ${(opsValue / 1800) * 250}deg 250deg, transparent 250deg 360deg)`,
                  }}
                ></div>
                <div style={{ width: "172px", height: "172px", borderRadius: "50%", background: "white", position: "absolute", top: "24px", left: "24px" }} className="dark:bg-[#0B1021]"></div>
                <div style={{ position: "absolute", left: "110px", top: "110px", width: "2px", height: "88px" }}>
                  <div
                    style={{
                      width: "3px",
                      height: "88px",
                      background: GOLD_COLOR,
                      borderRadius: "2px",
                      position: "absolute",
                      bottom: "0px",
                      left: "-1px",
                      transform: `rotate(${(opsValue / 1800) * 250 - 125}deg)`,
                    }}
                  ></div>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#374151", position: "absolute", bottom: "-5px", left: "-4px" }} className="dark:bg-white"></div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">OF 1,800 CEILING</div>
          </div>

          {/* AVG SPREAD CAPTURED */}
          <div>
            <div className="text-[11px] font-medium text-gray-400 tracking-wide mb-3">AVG SPREAD CAPTURED</div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="font-mono text-5xl font-bold" style={{ color: GOLD_COLOR }}>
                {spreadValue.toFixed(3)}
              </span>
              <span className="font-mono text-2xl font-semibold" style={{ color: GOLD_COLOR }}>%</span>
            </div>
            <div className="flex gap-[3px] mb-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="seg"
                  style={{
                    width: "10px",
                    height: "20px",
                    borderRadius: "2px",
                    background: i < (spreadValue / 0.4) * 20 ? GOLD_COLOR : "#e5e7eb",
                    opacity: i < (spreadValue / 0.4) * 20 ? 1 : 0.6,
                  }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 font-mono">
              <span>0</span>
              <span>27 BPS</span>
              <span>40 BPS</span>
            </div>
          </div>

          {/* EXECS TODAY */}
          <div>
            <div className="text-[11px] font-medium text-gray-400 tracking-wide mb-3">EXECS TODAY · UTC</div>
            <div className="font-mono text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {execsValue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1 mb-4">all filled · atomic legs · zero open positions</div>
            <div className="flex gap-8">
              <div>
                <div className="text-[11px] text-gray-400 mb-0.5">LATENCY P50</div>
                <div className="font-mono text-lg font-semibold text-gray-900 dark:text-white">{p50} ms</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 mb-0.5">P95</div>
                <div className="font-mono text-lg font-semibold text-gray-900 dark:text-white">{p95} ms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-[#1E293B] relative">
          <div>
            <div className="text-[11px] text-gray-400 mb-1">VENUES</div>
            <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white">38</div>
            <div className="text-[11px] text-gray-400 mt-0.5">across 12 chains</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 mb-1">CIRCUIT BREAKER</div>
            <div className="flex items-center gap-1.5 text-lg font-bold text-gray-900 dark:text-white">
              <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ background: GOLD_COLOR }}></span>
              ARMED
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">no trips today</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 mb-1">RESERVE RATIO</div>
            <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white">{reserveValue.toFixed(2)}×</div>
            <div className="text-[11px] text-gray-400 mt-0.5">liabilities covered</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 mb-1">FEED</div>
            <div className="flex items-center gap-1.5 text-lg font-bold text-green-500">
              <span className="h-1.5 w-1.5 rounded-full animate-ping bg-green-500"></span>
              Live
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">5s pulse · UTC</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-3xl">
        HyperGen is the liquidity intelligence engine watching twelve chains as one order book. Every gap it finds is simulated, routed and settled in the same breath — what you see below is the engine working.
      </p>

      {/* Execution Stream */}
      <div className="card p-6 mb-4 bg-white dark:bg-[#0B1021] border border-gray-200 dark:border-[#1E293B] rounded-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: GOLD_COLOR }}></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: GOLD_COLOR }}></span>
            </span>
            <span className="text-xs font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
              EXECUTION STREAM
            </span>
          </div>
          <div className="text-xs font-mono text-gray-400">UTC · POLLING</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="text-[11px] text-gray-400 mb-1">ROUTED · LAST HOUR</div>
            <div className="font-mono text-3xl font-bold" style={{ color: GOLD_COLOR }}>
              {formatCurrency(routedValue)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 mb-1">FILLS · LAST MINUTE</div>
            <div className="font-mono text-3xl font-bold text-gray-900 dark:text-white">{fillsValue}</div>
            <div className="text-[11px] text-gray-400 mt-1">last 30 min tracked</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 mb-1">FILLS / MIN · 30 MIN</div>
            <svg viewBox="0 0 300 60" className="w-full h-14">
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD_COLOR} stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor={GOLD_COLOR} stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path
                d="M 4 54.8 L 16.7 47.6 L 29.4 37.9 L 42.1 37.1 L 54.8 43.4 L 67.5 56 L 80.2 47.6 L 92.9 48.2 L 105.6 36.4 L 118.3 29.5 L 130.9 29.6 L 143.7 17.4 L 156.3 14.7 L 169 19.9 L 181.7 12.2 L 194.4 4 L 207.1 9 L 219.8 7.4 L 232.5 5.8 L 245.2 10.7 L 257.9 14.1 L 270.6 13.3 L 283.3 24.9 L 296 16.6 L 296 60 L 4 60 Z"
                fill="url(#sg)"
              ></path>
              <path
                d="M 4 54.8 L 16.7 47.6 L 29.4 37.9 L 42.1 37.1 L 54.8 43.4 L 67.5 56 L 80.2 47.6 L 92.9 48.2 L 105.6 36.4 L 118.3 29.5 L 130.9 29.6 L 143.7 17.4 L 156.3 14.7 L 169 19.9 L 181.7 12.2 L 194.4 4 L 207.1 9 L 219.8 7.4 L 232.5 5.8 L 245.2 10.7 L 257.9 14.1 L 270.6 13.3 L 283.3 24.9 L 296 16.6"
                fill="none"
                stroke={GOLD_COLOR}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <circle cx="296" cy="16.6" r="3" fill={GOLD_COLOR}></circle>
            </svg>
          </div>
        </div>

        {/* Chain Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {chains.map((chain) => (
            <button
              key={chain.name}
              onClick={() => setActiveChain(chain.name)}
              className={`rounded-full px-3 py-1.5 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                activeChain === chain.name
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeChain === chain.name ? "currentColor" : "#9ca3af" }}></span>
              {chain.name} <span className="text-gray-400">{chain.count}</span>
            </button>
          ))}
        </div>

        {/* Execution Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1E293B]">
                <th className="text-left px-3 py-2 text-[11px] font-medium text-gray-400">TIME</th>
                <th className="text-left px-3 py-2 text-[11px] font-medium text-gray-400">CHAIN</th>
                <th className="text-left px-3 py-2 text-[11px] font-medium text-gray-400">ROUTE</th>
                <th className="text-left px-3 py-2 text-[11px] font-medium text-gray-400">PAIR · TX</th>
                <th className="text-right px-3 py-2 text-[11px] font-medium text-gray-400">AMOUNT</th>
                <th className="text-right px-3 py-2 text-[11px] font-medium text-gray-400">SPREAD</th>
                <th className="text-right px-3 py-2 text-[11px] font-medium text-gray-400">LATENCY</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-[#1E293B]">
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">{row.time}</td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded border border-gray-200 dark:border-[#1E293B]">
                      {row.chain}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{row.route}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{row.pair}</div>
                    <div className="font-mono text-[10px] text-gray-400">{row.tx}</div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-gray-900 dark:text-white">{formatCurrency(row.amount)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-gray-500 dark:text-gray-400">{row.spread} bps</td>
                  <td className="px-3 py-2.5 text-right font-mono text-gray-500 dark:text-gray-400">{row.latency} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
