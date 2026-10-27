"use client";

import { useState, useEffect, useRef } from "react";

type LogType = "SCAN" | "ROUTE" | "SIM" | "EXEC" | "SETTLE" | "RISK" | "HEARTBEAT";

interface ConsoleLine {
  timestamp: string;
  type: LogType;
  message: string;
}

interface StatPill {
  label: string;
  value: string;
  color?: string;
}

interface VenueLatency {
  name: string;
  latency: number;
}

interface DepthRow {
  bidSize: number;
  bidPrice: number;
  askPrice: number;
  askSize: number;
}

const GOLD_COLOR = "#f5c451";

export default function AIEnginePage() {
  const [uptime, setUptime] = useState("69d 15:21:38");
  const [strategies, setStrategies] = useState("3 active");
  const [openPositions, setOpenPositions] = useState("0");
  const [realisedToday, setRealisedToday] = useState("+724.2 bps");
  const [winRate, setWinRate] = useState("98.0%");
  const [lastSettle, setLastSettle] = useState("AVAX/USDT +26.4 bps · 4s ago");

  const [activeFilters, setActiveFilters] = useState<Set<LogType>>(
    new Set(["SCAN", "ROUTE", "SIM", "EXEC", "SETTLE", "RISK", "HEARTBEAT"])
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([
    { timestamp: "12:35:00.845", type: "SETTLE", message: "filled · ETH/USDC · $1,188 · +22.4 bps · +$11.76" },
    { timestamp: "12:34:59.850", type: "SETTLE", message: "filled · ETH/USDC · $1,188 · +22.4 bps · +$11.76" },
    { timestamp: "12:34:58.849", type: "SIM", message: "ok · 2 legs simulated · $1,188 · 22.4 bps" },
    { timestamp: "12:34:57.848", type: "EXEC", message: "0x897465…2f43 sent · BSC · gas 0.0059 ETH · 406 ms" },
    { timestamp: "12:34:56.858", type: "ROUTE", message: "stable-basis · 3 legs · THENA → Meteora · expect 8.7 bps net" },
    { timestamp: "12:34:55.845", type: "SIM", message: "ok · 3 legs simulated · $1,244 · 8.7 bps" },
    { timestamp: "12:34:54.612", type: "EXEC", message: "0xbcfb51…4a1e sent · SOL · gas 0.0046 AVAX · 231 ms" },
    { timestamp: "12:34:53.768", type: "SCAN", message: "SOL AVAX/USDT · THENA → Aerodrome · gap 24.3 bps" },
    { timestamp: "12:34:52.672", type: "SIM", message: "ok · 3 legs simulated · $2,097 · 26.4 bps" },
    { timestamp: "12:34:51.213", type: "EXEC", message: "0x66f91c…fccf sent · SOL · gas 0.0031 ETH · 480 ms" },
    { timestamp: "12:34:50.364", type: "SETTLE", message: "filled · AVAX/USDT · $2,097 · +26.4 bps · +$9.27" },
    { timestamp: "12:34:49.514", type: "SCAN", message: "AVAX BNB/USDT · Curve → BaseSwap · gap 30.4 bps" },
    { timestamp: "12:34:48.664", type: "SETTLE", message: "filled · BNB/USDT · $1,244 · +8.7 bps · +$9.09" },
    { timestamp: "12:34:47.815", type: "EXEC", message: "0x2d8349…5e9f sent · AVAX · gas 0.0057 ETH · 326 ms" },
    { timestamp: "12:34:46.920", type: "SIM", message: "ok · 2 legs simulated · $735 · 15.1 bps" },
    { timestamp: "12:34:45.264", type: "EXEC", message: "0x781c15…5d6e sent · AVAX · gas 0.0010 BNB · 432 ms" },
    { timestamp: "12:34:44.413", type: "SETTLE", message: "filled · ARB/ETH · $1,507 · +17.0 bps · +$5.28" },
    { timestamp: "12:34:43.564", type: "SCAN", message: "SOL BNB/USDT · Trader Joe → 1inch · gap 43.8 bps" },
    { timestamp: "12:34:42.713", type: "EXEC", message: "0x1649f2…adaf sent · ARB · gas 0.0051 ETH · 858 ms" },
    { timestamp: "12:34:41.862", type: "ROUTE", message: "cross-venue · 3 legs · Camelot → Meteora · expect 14.1 bps net" },
    { timestamp: "12:34:40.164", type: "SIM", message: "ok · 3 legs simulated · $522 · 14.1 bps" },
    { timestamp: "12:34:39.315", type: "EXEC", message: "0x6546f1…8219 sent · BASE · gas 0.0027 ETH · 805 ms" },
    { timestamp: "12:34:38.463", type: "SETTLE", message: "filled · BNB/USDT · $703 · +13.2 bps · +$6.48" },
    { timestamp: "12:34:37.613", type: "ROUTE", message: "cross-venue · 3 legs · THENA → BaseSwap · expect 13.2 bps net" },
    { timestamp: "12:34:36.765", type: "SIM", message: "ok · 3 legs simulated · $703 · 13.2 bps" },
    { timestamp: "12:34:35.063", type: "EXEC", message: "0x8b0db8…78ec sent · ARB · gas 0.0010 BNB · 816 ms" },
    { timestamp: "12:34:34.214", type: "SETTLE", message: "filled · ARB/ETH · $630 · +21.0 bps · +$11.45" },
    { timestamp: "12:34:33.364", type: "ROUTE", message: "perp-spot · 2 legs · Orca → BaseSwap · expect 21.0 bps net" },
    { timestamp: "12:34:32.513", type: "SIM", message: "ok · 2 legs simulated · $630 · 21.0 bps" },
    { timestamp: "12:34:31.663", type: "EXEC", message: "0x16aa53…3e8d sent · SOL · gas 0.0063 BNB · 139 ms" },
    { timestamp: "12:34:30.818", type: "SETTLE", message: "filled · BNB/USDT · $3,137 · +34.7 bps · +$11.90" },
    { timestamp: "12:34:29.963", type: "SIM", message: "ok · 2 legs simulated · $3,137 · 34.7 bps" },
    { timestamp: "12:34:28.262", type: "EXEC", message: "0xd52ee3…14fa sent · SOL · gas 0.0044 ETH · 798 ms" },
    { timestamp: "12:34:27.413", type: "SETTLE", message: "filled · SOL/USDC · $2,666 · +25.7 bps · +$11.14" },
    { timestamp: "12:34:26.102", type: "ROUTE", message: "perp-spot · 2 legs · Curve → BaseSwap · expect 15.1 bps net" },
    { timestamp: "12:34:25.233", type: "SCAN", message: "AVAX BNB/USDT · Curve → BaseSwap · gap 30.4 bps" },
    { timestamp: "12:34:24.363", type: "SETTLE", message: "filled · AVAX/USDT · $2,097 · +26.4 bps · +$9.27" },
    { timestamp: "12:34:23.514", type: "EXEC", message: "0x66f91c…fccf sent · SOL · gas 0.0031 ETH · 480 ms" },
    { timestamp: "12:34:22.672", type: "SIM", message: "ok · 3 legs simulated · $2,097 · 26.4 bps" },
    { timestamp: "12:34:21.842", type: "ROUTE", message: "perp-spot · 3 legs · THENA → Aerodrome · expect 26.4 bps net" },
    { timestamp: "12:34:20.964", type: "SCAN", message: "SOL AVAX/USDT · THENA → Aerodrome · gap 24.3 bps" },
    { timestamp: "12:34:20.115", type: "SETTLE", message: "filled · SOL/USDC · $2,666 · +25.7 bps · +$11.14" },
    { timestamp: "12:34:19.263", type: "EXEC", message: "0xfdcce8…553f sent · SOL · gas 0.0046 AVAX · 231 ms" },
    { timestamp: "12:34:18.417", type: "SIM", message: "ok · 2 legs simulated · $2,666 · 25.7 bps" },
    { timestamp: "12:34:17.569", type: "ROUTE", message: "tri-arb · 2 legs · THENA → Jupiter · expect 25.7 bps net" },
    { timestamp: "12:34:16.717", type: "SCAN", message: "SOL SOL/USDC · THENA → Jupiter · gap 11.8 bps" },
    { timestamp: "12:34:15.864", type: "SETTLE", message: "filled · ARB/ETH · $630 · +21.0 bps · +$11.45" },
    { timestamp: "12:34:15.237", type: "EXEC", message: "0x047512…7444 sent · BSC · gas 0.0072 AVAX · 896 ms" },
    { timestamp: "12:34:14.847", type: "SIM", message: "ok · 2 legs simulated · $630 · 21.0 bps" },
    { timestamp: "12:34:13.853", type: "ROUTE", message: "perp-spot · 2 legs · Orca → BaseSwap · expect 21.0 bps net" },
    { timestamp: "12:34:12.856", type: "SCAN", message: "BSC ARB/ETH · Orca → BaseSwap · gap 47.0 bps" },
    { timestamp: "12:34:11.852", type: "SETTLE", message: "filled · BNB/USDT · $3,137 · +34.7 bps · +$11.90" },
    { timestamp: "12:34:10.856", type: "EXEC", message: "0x2ca630…bb53 sent · SOL · gas 0.0063 BNB · 139 ms" },
    { timestamp: "12:34:09.856", type: "SIM", message: "ok · 2 legs simulated · $3,137 · 34.7 bps" },
  ]);

  const [latencyP50, setLatencyP50] = useState("85 MS");
  const [routeLabel, setRouteLabel] = useState("ARB → ARB");
  const [depthPair, setDepthPair] = useState("ARB/ETH");
  const [midValue, setMidValue] = useState("171.47");
  const [midBarWidth, setMidBarWidth] = useState(64);
  const [activeRouteIndex, setActiveRouteIndex] = useState(4);

  const [venueLatencies, setVenueLatencies] = useState<VenueLatency[]>([
    { name: "Orca", latency: 63 },
    { name: "Uniswap v3", latency: 67 },
    { name: "Camelot", latency: 75 },
    { name: "Aerodrome", latency: 83 },
    { name: "Trader Joe", latency: 85 },
    { name: "Pangolin", latency: 88 },
    { name: "Raydium", latency: 105 },
    { name: "THENA", latency: 150 },
  ]);

  const [depthRows, setDepthRows] = useState<DepthRow[]>([
    { bidSize: 3011, bidPrice: 171.54, askPrice: 171.54, askSize: 1880 },
    { bidSize: 3804, bidPrice: 171.61, askPrice: 171.61, askSize: 3700 },
    { bidSize: 1797, bidPrice: 171.68, askPrice: 171.68, askSize: 2850 },
    { bidSize: 3219, bidPrice: 171.75, askPrice: 171.75, askSize: 980 },
    { bidSize: 1917, bidPrice: 171.82, askPrice: 171.82, askSize: 1450 },
  ]);

  const consoleRef = useRef<HTMLDivElement>(null);

  // Simulate live console logs
  useEffect(() => {
    const logTypes: LogType[] = ["SCAN", "ROUTE", "SIM", "EXEC", "SETTLE"];
    const messages = [
      "SOL ETH/USDC · Curve → Meteora · gap 14.0 bps",
      "perp-spot · 2 legs · Curve → Meteora · expect 22.4 bps net",
      "ok · 2 legs simulated · $1,188 · 22.4 bps",
      "0xabf62c…56e1 sent · SOL · gas 0.0037 BNB · 126 ms",
      "filled · ETH/USDC · $1,188 · +22.4 bps · +$11.76",
    ];

    const addLog = () => {
      const now = new Date();
      const timestamp = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
      const type = logTypes[Math.floor(Math.random() * logTypes.length)]!;
      const message = messages[Math.floor(Math.random() * messages.length)]!;

      setConsoleLines((prev) => {
        const newLines: ConsoleLine[] = [{ timestamp, type, message }, ...prev].slice(0, 50);
        return newLines;
      });
    };

    const interval = setInterval(addLog, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll console to top
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = 0;
    }
  }, [consoleLines]);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => {
        const [days, time] = prev.split(" ");
        const timeStr = time ?? "00:00:00";
        const timeParts = timeStr.split(":").map(Number);
        const h = timeParts[0] ?? 0;
        const m = timeParts[1] ?? 0;
        const s = timeParts[2] ?? 0;
        const newS = s + 1;
        const newM = newS >= 60 ? m + 1 : m;
        const newH = newM >= 60 ? h + 1 : h;
        return `${days} ${newH}:${String(newM % 60).padStart(2, "0")}:${String(newS % 60).padStart(2, "0")}`;
      });

      setMidValue((prev) => (parseFloat(prev) + (Math.random() - 0.5) * 0.1).toFixed(2));
      setMidBarWidth((prev) => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));

      setVenueLatencies((prev) =>
        prev.map((v) => ({ ...v, latency: Math.max(50, Math.min(200, v.latency + (Math.random() - 0.5) * 10)) }))
      );

      setDepthRows((prev) =>
        prev.map((row) => ({
          ...row,
          bidSize: Math.max(1000, row.bidSize + (Math.random() - 0.5) * 500),
          askSize: Math.max(1000, row.askSize + (Math.random() - 0.5) * 500),
        }))
      );

      // Rotate active route
      setActiveRouteIndex((prev) => {
        const newIndex = (prev + 1) % 6;
        const labels = ["AVAX", "ETH", "SOL", "BSC", "ARB", "BASE"];
        setRouteLabel(`${labels[newIndex]} → HUB`);
        return newIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleFilter = (type: LogType) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(type)) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
  };

  const filteredLines = consoleLines.filter(
    (line) =>
      activeFilters.has(line.type) &&
      (searchQuery === "" || line.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeColor = (type: LogType): string => {
    const colors: Record<LogType, string> = {
      SCAN: "#9ca3af",
      ROUTE: "#e5e7eb",
      SIM: "#9ca3af",
      EXEC: GOLD_COLOR,
      SETTLE: "#22c55e",
      RISK: "#f59e0b",
      HEARTBEAT: GOLD_COLOR,
    };
    return colors[type];
  };

  const copyConsole = () => {
    const text = filteredLines
      .slice(0, 50)
      .map((line) => `${line.timestamp} ${line.type} ${line.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Status Card */}
      <div className="card p-5 sm:p-6 mb-5 bg-white dark:bg-[#0B1021] border border-gray-200 dark:border-[#1E293B] rounded-lg">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: GOLD_COLOR }}></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: GOLD_COLOR }}></span>
              </span>
            </span>
            <div>
              <div className="text-[11px] font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                HYPERBOT · EXECUTION
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Running</span>
                <span className="text-xs text-gray-400">feed live · UTC</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 ml-auto">
            <StatPill label="UPTIME" value={uptime} />
            <StatPill label="STRATEGIES" value={strategies} />
            <StatPill label="OPEN POSITIONS" value={openPositions} />
            <StatPill label="REALISED TODAY" value={realisedToday} color={GOLD_COLOR} />
            <StatPill label="WIN RATE" value={winRate} />
            <StatPill label="LAST SETTLE" value={lastSettle} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-5">
        {/* Console */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: GOLD_COLOR }}></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: GOLD_COLOR }}></span>
              </span>
              <span className="text-xs font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                CONSOLE TAILING
              </span>
            </div>
            <button
              onClick={copyConsole}
              className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Copy last 50
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["SCAN", "ROUTE", "SIM", "EXEC", "SETTLE", "RISK", "HEARTBEAT"] as LogType[]).map((type) => (
              <button
                key={type}
                data-type={type}
                onClick={() => toggleFilter(type)}
                className={`filter-btn rounded-full px-2.5 py-1 text-[11px] font-mono font-medium flex items-center gap-1 transition-colors ${
                  activeFilters.has(type)
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }}></span>
                {type}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search lines"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1E293B] bg-transparent outline-none text-gray-900 dark:text-white"
          />

          <div
            ref={consoleRef}
            className="font-mono text-xs leading-relaxed rounded-lg border border-gray-200 dark:border-[#1E293B] p-3 h-[500px] overflow-x-auto overflow-y-auto bg-gray-50 dark:bg-[#0a0f1d]"
          >
            {filteredLines.map((line, index) => (
              <div key={index} className="flex gap-2 py-0.5 min-w-max">
                <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">{line.timestamp}</span>
                <span
                  className="font-semibold whitespace-nowrap"
                  style={{ color: getTypeColor(line.type) }}
                >
                  {line.type}
                </span>
                <span className="text-gray-900 dark:text-gray-100">{line.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Latency */}
            <div className="card p-5 bg-white dark:bg-[#0B1021] border border-gray-200 dark:border-[#1E293B] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                  LATENCY
                </span>
                <span className="text-xs font-mono text-gray-400">
                  P50 <span className="font-semibold text-gray-900 dark:text-white">{latencyP50}</span>
                </span>
              </div>

              <svg viewBox="0 0 200 200" className="w-full">
                <g stroke="#e5e7eb" fill="none">
                  <circle cx="100" cy="100" r="27.5"></circle>
                  <circle cx="100" cy="100" r="55"></circle>
                  <circle cx="100" cy="100" r="82.5"></circle>
                  <line x1="100" y1="10" x2="100" y2="190"></line>
                  <line x1="10" y1="100" x2="190" y2="100"></line>
                </g>
                <text x="103" y="75.5" fontSize="7" fill="#9ca3af" fontFamily="monospace">
                  50
                </text>
                <text x="103" y="48" fontSize="7" fill="#9ca3af" fontFamily="monospace">
                  100
                </text>
                <text x="103" y="20.5" fontSize="7" fill="#9ca3af" fontFamily="monospace">
                  150
                </text>
                {venueLatencies.map((venue, i) => {
                  const angle = (i / venueLatencies.length) * 2 * Math.PI - Math.PI / 2;
                  const radius = 50 + (venue.latency / 150) * 40;
                  const x = 100 + radius * Math.cos(angle);
                  const y = 100 + radius * Math.sin(angle);
                  return (
                    <circle
                      key={venue.name}
                      r="4"
                      fill={GOLD_COLOR}
                      cx={x}
                      cy={y}
                      opacity="0.9"
                    />
                  );
                })}
              </svg>

              <div className="mt-2 space-y-1">
                {venueLatencies.map((venue) => (
                  <div
                    key={venue.name}
                    className="flex items-center justify-between text-[11px] font-mono"
                  >
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className="h-1 w-1 rounded-full" style={{ background: GOLD_COLOR }}></span>
                      {venue.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(venue.latency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Route */}
            <div className="card p-5 bg-white dark:bg-[#0B1021] border border-gray-200 dark:border-[#1E293B] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                  ROUTE
                </span>
                <span className="text-xs font-mono text-gray-400">{routeLabel}</span>
              </div>

              <svg viewBox="0 0 200 200" className="w-full">
                <g style={{ transformOrigin: "100px 100px" }}>
                  <circle
                    cx="100"
                    cy="100"
                    r="72"
                    fill="none"
                    stroke={GOLD_COLOR}
                    strokeOpacity="0.12"
                    strokeWidth="18"
                    strokeDasharray="18 220"
                    strokeLinecap="round"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 100 100"
                      to="360 100 100"
                      dur="20s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>

                {[
                  { x: 100, y: 28 },
                  { x: 162.35, y: 64 },
                  { x: 162.35, y: 136 },
                  { x: 100, y: 172 },
                  { x: 37.65, y: 136 },
                  { x: 37.65, y: 64 },
                ].map((pos, i) => (
                  <line
                    key={i}
                    x1="100"
                    y1="100"
                    x2={pos.x}
                    y2={pos.y}
                    stroke={i === activeRouteIndex ? GOLD_COLOR : "#e5e7eb"}
                    strokeWidth={i === activeRouteIndex ? 2.5 : 1.5}
                    opacity={i === activeRouteIndex ? 1 : 0.7}
                  />
                ))}

                {[
                  { x: 100, y: 28, label: "AVAX" },
                  { x: 162.35, y: 64, label: "ETH" },
                  { x: 162.35, y: 136, label: "SOL" },
                  { x: 100, y: 172, label: "BSC" },
                  { x: 37.65, y: 136, label: "ARB" },
                  { x: 37.65, y: 64, label: "BASE" },
                ].map((node, i) => (
                  <g key={node.label}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={i === activeRouteIndex ? 21 : 19}
                      fill="white"
                      stroke={i === activeRouteIndex ? GOLD_COLOR : "#e5e7eb"}
                      strokeWidth="1.5"
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="monospace"
                      fill="#6b7280"
                    >
                      {node.label}
                    </text>
                  </g>
                ))}

                <circle cx="100" cy="100" r="26" fill="#374151"></circle>
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="monospace"
                  fill="white"
                  letterSpacing="0.5"
                >
                  HUB
                </text>
              </svg>
            </div>
          </div>

          {/* Depth */}
          <div className="card p-5 sm:p-6 bg-white dark:bg-[#0B1021] border border-gray-200 dark:border-[#1E293B] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                DEPTH
              </span>
              <span className="text-xs font-mono text-gray-400">{depthPair}</span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-gray-400">MID</span>
              <span className="font-mono text-xl font-bold text-gray-900 dark:text-white">{midValue}</span>
            </div>

            <div className="h-2 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${midBarWidth}%`, background: GOLD_COLOR }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-mono">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD_COLOR }}></span>
                BIDS
              </span>
              <span>ASKS</span>
            </div>

            <div className="space-y-1">
              {depthRows.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_auto_1fr] items-center gap-2 text-[11px] font-mono"
                >
                  <div className="flex justify-end">
                    <div
                      className="h-3 rounded-sm bg-yellow-100 dark:bg-yellow-900/30"
                      style={{ width: `${(row.bidSize / 4000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right font-medium" style={{ color: GOLD_COLOR }}>{row.bidSize.toLocaleString()}</div>
                  <div className="text-gray-600 dark:text-gray-300">{row.bidPrice.toFixed(2)}</div>
                  <div className="flex">
                    <div
                      className="h-3 rounded-sm bg-gray-200 dark:bg-gray-700"
                      style={{ width: `${(row.askSize / 4000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: StatPill) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#1E293B] px-3 py-1.5 bg-white dark:bg-[#0B1021]">
      <div className="text-[10px] text-gray-400">{label}</div>
      <div className="font-mono text-sm font-semibold" style={{ color: color || GOLD_COLOR }}>
        {value}
      </div>
    </div>
  );
}
