"use client";

import { useState, useEffect, useRef } from "react";

type LogType = "SCAN" | "ROUTE" | "SIM" | "EXEC" | "SETTLE" | "RISK" | "HEARTBEAT";

interface ConsoleLine {
  Datex: string;
  type: LogType;
  message: string;
  transactionHash?: string;
  networkChain?: string;
}

interface TransactionLog {
  statusCode: number;
  message: string;
  Id: number;
  NetworkChain: string;
  BaseUrl: string;
  TransactionHash: string;
  Datex: string;
  Amount: number;
  FromAddress: string;
  ToAddress: string;
  TokenSymbol: string;
  BlockNo: number | null;
  CreatedAt: string;
  rn: number;
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

const ACCENT_COLOR = "#1680ff";

export default function AIEnginePage() {
  const [status, setStatus] = useState("Running");
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
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [latencyP50, _setLatencyP50] = useState("85 MS");
  const [routeLabel, setRouteLabel] = useState("ARB → ARB");
  const [depthPair, _setDepthPair] = useState("ARB/ETH");
  const [midValue, setMidValue] = useState("176.47");
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
    { bidSize: 2456, bidPrice: 171.89, askPrice: 171.89, askSize: 2100 },
    { bidSize: 3890, bidPrice: 171.96, askPrice: 171.96, askSize: 3250 },
    { bidSize: 2102, bidPrice: 172.03, askPrice: 172.03, askSize: 1890 },
    { bidSize: 4567, bidPrice: 172.10, askPrice: 172.10, askSize: 2780 },
    { bidSize: 1890, bidPrice: 172.17, askPrice: 172.17, askSize: 3420 },
  ]);

  const consoleRef = useRef<HTMLDivElement>(null);

  // Fetch transaction logs from API every 1 minute
  useEffect(() => {
    const fetchTransactionLogs = async () => {
      try {
        const response = await fetch("/api/Authentication/getAllTransactionLog");
        const data = await response.json();
        if (data.statusCode === 200 && data.data) {
          setTransactionLogs(data.data);
          // Convert transaction logs to console lines
          const consoleLinesFromLogs: ConsoleLine[] = data.data.map((log: TransactionLog) => {
            const message = `${log.NetworkChain} ${log.TokenSymbol} · ${log.Amount.toFixed(8)} · ${log.TransactionHash}`;
            return {
              Datex: log.Datex,
              type: "EXEC" as LogType,
              message,
              transactionHash: log.TransactionHash,
              networkChain: log.NetworkChain,
            };
          });
          setConsoleLines(consoleLinesFromLogs.slice(0, 50));
        }
      } catch (error) {
        console.error("Failed to fetch transaction logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionLogs();
    const interval = setInterval(fetchTransactionLogs, 5000);
    return () => clearInterval(interval);
  }, []);

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
      const Datex = now.toISOString();
      const type = logTypes[Math.floor(Math.random() * logTypes.length)]!;
      const message = messages[Math.floor(Math.random() * messages.length)]!;

      setConsoleLines((prev) => {
        const newLines: ConsoleLine[] = [{ Datex, type, message }, ...prev].slice(0, 50);
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

      // Update status dynamically
      setStatus((prev) => (prev === "Running" ? "Processing" : "Running"));

      // Update stats based on transaction logs
      if (transactionLogs.length > 0) {
        const uniqueNetworks = new Set(transactionLogs.map((log) => log.NetworkChain));
        const totalTransactions = transactionLogs.length;
        const totalAmount = transactionLogs.reduce((sum, log) => sum + log.Amount, 0);

        // Group by token symbol to get total amount per token
        const amountByToken = transactionLogs.reduce((acc, log) => {
          acc[log.TokenSymbol] = (acc[log.TokenSymbol] || 0) + log.Amount;
          return acc;
        }, {} as Record<string, number>);

        // Use the token with highest amount
        const maxToken = Object.entries(amountByToken).sort((a, b) => b[1] - a[1])[0];
        const tokenSymbol = maxToken ? maxToken[0] : "USDT";
        const totalAmountForDisplay = maxToken ? maxToken[1] : totalAmount;

        setStrategies(`${uniqueNetworks.size} active`);
        setOpenPositions(totalTransactions.toString());
        setRealisedToday(`+${totalAmountForDisplay.toFixed(2)} ${tokenSymbol}`);
        setWinRate("98.0%");

        const lastTx = transactionLogs[0];
        if (lastTx) {
          const lastTxDate = new Date(lastTx.Datex);
          const now = new Date();
          const timeDiff = Math.floor((now.getTime() - lastTxDate.getTime()) / 1000 / 60); // in minutes
          const timeAgo = timeDiff < 60 ? `${timeDiff}m ago` : `${Math.floor(timeDiff / 60)}h ago`;
          setLastSettle(`${lastTx.NetworkChain}/${lastTx.TokenSymbol} · ${lastTx.Amount.toFixed(2)} · ${timeAgo}`);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [transactionLogs]);

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
      EXEC: ACCENT_COLOR,
      SETTLE: "#22c55e",
      RISK: "#f59e0b",
      HEARTBEAT: ACCENT_COLOR,
    };
    return colors[type];
  };

  const getExplorerUrl = (hash: string, network?: string): string => {
    if (!hash) return "#";

    const networkLower = network?.toLowerCase() || "";

    if (networkLower.includes("avax") || networkLower.includes("avalanche")) {
      return `https://snowtrace.io/tx/${hash}`;
    } else if (networkLower.includes("eth") || networkLower.includes("ethereum")) {
      return `https://etherscan.io/tx/${hash}`;
    } else if (networkLower.includes("sol") || networkLower.includes("solana")) {
      return `https://solscan.io/tx/${hash}`;
    } else if (networkLower.includes("bsc") || networkLower.includes("binance")) {
      return `https://bscscan.com/tx/${hash}`;
    } else if (networkLower.includes("arb") || networkLower.includes("arbitrum")) {
      return `https://arbiscan.io/tx/${hash}`;
    } else if (networkLower.includes("base")) {
      return `https://basescan.org/tx/${hash}`;
    }

    // Default to BSC explorer
    return `https://bscscan.com/tx/${hash}`;
  };

  const copyConsole = () => {
    const text = filteredLines
      .slice(0, 50)
      .map((line) => `${line.Datex} ${line.type} ${line.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Status Card */}
      <div className="card p-5 sm:p-6 mb-5 bg-white dark:bg-[#0B1021] border border-gray-200 dark:border-[#1E293B] rounded-lg">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-cyan-900/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: ACCENT_COLOR }}></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: ACCENT_COLOR }}></span>
              </span>
            </span>
            <div>
              <div className="text-[11px] font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                HYPERBOT · EXECUTION
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{status}</span>
                <span className="text-xs text-gray-400">feed live · UTC</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 ml-auto">
            <StatPill label="UPTIME" value={uptime} />
            <StatPill label="STRATEGIES" value={strategies} />
            <StatPill label="OPEN POSITIONS" value={openPositions} />
            <StatPill label="REALISED TODAY" value={realisedToday} color={ACCENT_COLOR} />
            <StatPill label="WIN RATE" value={winRate} />
            <StatPill label="LAST SETTLE" value={lastSettle} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 mb-5">
        {/* Console */}
        <div className="flex flex-col gap-3 lg:col-span-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: ACCENT_COLOR }}></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: ACCENT_COLOR }}></span>
              </span>
              <span className="text-xs font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                CONSOLE TAILING
              </span>
            </div>

          </div>



          <div
            ref={consoleRef}
            className="font-mono text-xs leading-relaxed rounded-lg border border-gray-200 dark:border-[#1E293B] p-3 h-[500px] overflow-x-auto overflow-y-auto bg-gray-50 dark:bg-[#0a0f1d]"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Loading transaction logs...
              </div>
            ) : (
              filteredLines.map((line, index) => {
                const formattedTime = line.Datex.replace("T", " ");
                const messageParts = line.message.split(" · ");
                const txHash = messageParts[messageParts.length - 1];
                const messageWithoutHash = messageParts.slice(0, -1).join(" · ");

                return (
                  <div key={index} className="flex gap-2 py-0.5 min-w-max">
                    <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">{formattedTime}</span>
                    <span
                      className="font-semibold whitespace-nowrap"
                      style={{ color: getTypeColor(line.type) }}
                    >
                      {line.type}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{messageWithoutHash} · </span>
                    {line.transactionHash ? (
                      <a
                        href={getExplorerUrl(line.transactionHash, line.networkChain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
                      >
                        {txHash}
                      </a>
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100">{txHash}</span>
                    )}
                  </div>
                );
              })
            )}
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
                stroke={ACCENT_COLOR}
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
                stroke={i === activeRouteIndex ? ACCENT_COLOR : "#e5e7eb"}
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
                  stroke={i === activeRouteIndex ? ACCENT_COLOR : "#e5e7eb"}
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

           <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: "#00FFA3" }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#00FFA3" }}></span>
                </span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">SOLANA</span>
              </div>
              <span className="text-xs font-mono text-green-500">● LIVE</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: "#627EEA" }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#627EEA" }}></span>
                </span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">ETHEREUM</span>
              </div>
              <span className="text-xs font-mono text-green-500">● LIVE</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: "#E84142" }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#E84142" }}></span>
                </span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">AVALANCHE</span>
              </div>
              <span className="text-xs font-mono text-green-500">● LIVE</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: "#F3BA2F" }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#F3BA2F" }}></span>
                </span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">BSC</span>
              </div>
              <span className="text-xs font-mono text-green-500">● LIVE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 mb-5">
        {/* Latency - Left side, smaller */}
        <div className="card p-4 bg-white dark:bg-[#0B1021] border border-gray-200 dark:border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold tracking-wide text-gray-500 dark:text-gray-400">
              LATENCY
            </span>
            <span className="text-xs font-mono text-gray-400">
              P50 <span className="font-semibold text-gray-900 dark:text-white">{latencyP50}</span>
            </span>
          </div>

          <svg viewBox="0 0 200 200" className="w-full max-h-[250px]">
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
                  fill={ACCENT_COLOR}
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
                  <span className="h-1 w-1 rounded-full" style={{ background: ACCENT_COLOR }}></span>
                  {venue.name}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(venue.latency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Depth - Right side */}
        <div className="card p-5 sm:p-6 bg-white dark:bg-[#0B1021] border border-gray-200 dark:border-[#1E293B] rounded-lg lg:col-span-3">
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
              style={{ width: `${midBarWidth}%`, background: ACCENT_COLOR }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-mono">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT_COLOR }}></span>
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
                    className="h-3 rounded-sm bg-blue-100 dark:bg-blue-900/30"
                    style={{ width: `${(row.bidSize / 4000) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right font-medium text-blue-700 dark:text-cyan-300">{row.bidSize.toLocaleString()}</div>
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
  );
}

function StatPill({ label, value, color }: StatPill) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#1E293B] px-3 py-1.5 bg-white dark:bg-[#0B1021]">
      <div className="text-[10px] text-gray-400">{label}</div>
      <div className="font-mono text-sm font-semibold" style={{ color: color || ACCENT_COLOR }}>
        {value}
      </div>
    </div>
  );
}