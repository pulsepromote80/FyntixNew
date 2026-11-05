"use client";

import { useState, useEffect, useRef } from "react";

type CategoryType = "forex" | "crypto" | "metals" | "indices" | "commodities";
type AnalysisType = "quick" | "intraday" | "swing" | "scalping" | "position" | "outlook";
type RiskType = "low" | "med" | "high";

interface TradeLevels {
  entry: number | null;
  sl: number | null;
  tp1: number | null;
  tp2: number | null;
  rr: string | null;
}

interface ReportData {
  instrument: string;
  signal: string;
  trend: string;
  confidence: number;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  rr: string;
  riskLevel: string;
  indicators: {
    rsi: number;
    macd: string;
    ema: string;
    atr: string;
    adx: string;
  };
  structure: {
    trend: string;
    liquidity: string;
    support: number;
    resistance: number;
    flow: string;
  };
  news: Array<{ text: string; sentiment: string }>;
  cal: Array<{ time: string; event: string; impact: string }>;
  reasoning: string;
  timestamp: string;
}

interface HistoryEntry {
  date: Date;
  instrument: string;
  category: CategoryType;
  trend: string;
  confidence: number;
  credits: number;
  data: ReportData;
}

export default function AIAssistantPage() {
  const [credits, setCredits] = useState(845);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("forex");
  const [selectedType, setSelectedType] = useState<AnalysisType>("quick");
  const [selectedRisk, setSelectedRisk] = useState<RiskType>("low");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState("--:--:-- UTC");
  const [tradeLevels, setTradeLevels] = useState<TradeLevels>({
    entry: null,
    sl: null,
    tp1: null,
    tp2: null,
    rr: null,
  });

  const reportRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLSpanElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);
  const gaugeCircleRef = useRef<SVGCircleElement>(null);
  const confNumRef = useRef<HTMLDivElement>(null);
  const tvContainerRef = useRef<HTMLDivElement>(null);

  const assetMap: Record<CategoryType, string[]> = {
    forex: [
      "EUR/USD — Euro / US Dollar",
      "GBP/USD — British Pound / US Dollar",
      "USD/JPY — US Dollar / Japanese Yen",
      "AUD/USD — Australian Dollar / US Dollar",
      "USD/CAD — US Dollar / Canadian Dollar",
      "USD/CHF — US Dollar / Swiss Franc",
      "NZD/USD — New Zealand Dollar / US Dollar",
      "XAU/USD — Gold / US Dollar",
      "XAG/USD — Silver / US Dollar",
    ],
    crypto: [
      "BTC/USDT — Bitcoin / Tether",
      "ETH/USDT — Ethereum / Tether",
      "SOL/USDT — Solana / Tether",
      "BNB/USDT — BNB / Tether",
      "XRP/USDT — Ripple / Tether",
      "DOGE/USDT — Dogecoin / Tether",
      "ADA/USDT — Cardano / Tether",
      "AVAX/USDT — Avalanche / Tether",
    ],
    metals: [
      "XAU/USD — Gold / US Dollar",
      "XAG/USD — Silver / US Dollar",
      "XPT/USD — Platinum / US Dollar",
      "XPD/USD — Palladium / US Dollar",
      "COPPER — Copper CFD",
    ],
    indices: [
      "US30 — Dow Jones Industrial",
      "NAS100 — NASDAQ 100",
      "SP500 — S&P 500",
      "DAX — Germany DAX 40",
      "FTSE100 — UK FTSE 100",
      "NIKKEI — Japan Nikkei 225",
      "HSI — Hang Seng Index",
    ],
    commodities: [
      "WTI/USD — Crude Oil WTI",
      "BRENT/USD — Crude Oil Brent",
      "NGAS/USD — Natural Gas",
      "WHEAT — Wheat Futures",
      "CORN — Corn Futures",
      "SOYBEANS — Soybean Futures",
    ],
  };

  const tvMap: Record<string, string> = {
    "EUR/USD": "FX:EURUSD",
    "GBP/USD": "FX:GBPUSD",
    "USD/JPY": "FX:USDJPY",
    "AUD/USD": "FX:AUDUSD",
    "USD/CAD": "FX:USDCAD",
    "USD/CHF": "FX:USDCHF",
    "NZD/USD": "FX:NZDUSD",
    "XAU/USD": "OANDA:XAUUSD",
    "XAG/USD": "OANDA:XAGUSD",
    "XPT/USD": "OANDA:XPTUSD",
    "XPD/USD": "OANDA:XPDUSD",
    "BTC/USDT": "BINANCE:BTCUSDT",
    "ETH/USDT": "BINANCE:ETHUSDT",
    "SOL/USDT": "BINANCE:SOLUSDT",
    "BNB/USDT": "BINANCE:BNBUSDT",
    "XRP/USDT": "BINANCE:XRPUSDT",
    "DOGE/USDT": "BINANCE:DOGEUSDT",
    "ADA/USDT": "BINANCE:ADAUSDT",
    "AVAX/USDT": "BINANCE:AVAXUSDT",
    COPPER: "COMEX:HG1!",
    US30: "TVC:DJI",
    NAS100: "TVC:NDX",
    SP500: "TVC:SPX",
    DAX: "TVC:DAX",
    FTSE100: "TVC:UKX",
    NIKKEI: "TVC:NI225",
    HSI: "TVC:HSI",
    "WTI/USD": "TVC:USOIL",
    "BRENT/USD": "TVC:UKOIL",
    "NGAS/USD": "NYMEX:NG1!",
    WHEAT: "CBOT:ZW1!",
    CORN: "CBOT:ZC1!",
    SOYBEANS: "CBOT:ZS1!",
  };

  const loadingSteps = [
    "Scanning Markets...",
    "Analyzing Liquidity...",
    "Reading Economic Calendar...",
    "Checking Smart Money Flow...",
    "Calculating Risk Parameters...",
    "Evaluating News Sentiment...",
    "Generating Institutional Report...",
  ];

  function getMockResponse(cat: CategoryType, asset: string, type: AnalysisType, risk: RiskType): ReportData {
    const assetName = asset.split(" — ")[0] || asset;
    const isGold = assetName.includes("XAU") || assetName.includes("Gold");
    const isBTC = assetName.includes("BTC");
    const conf = Math.floor(78 + Math.random() * 18);
    const isBull = Math.random() > 0.35;
    const signal = isBull ? "BUY" : "SELL";
    const trend = isBull ? "Bullish" : "Bearish";

    let entry: number, sl: number, tp1: number, tp2: number, sup: number, res: number;
    if (isGold) {
      entry = 4354;
      sl = 4344;
      tp1 = 4367;
      tp2 = 4381;
      sup = 4347;
      res = 4377;
    } else if (isBTC) {
      entry = 67100;
      sl = 65800;
      tp1 = 68500;
      tp2 = 70000;
      sup = 66200;
      res = 68800;
    } else if (assetName.includes("EUR")) {
      entry = 1.0841;
      sl = isBull ? 1.081 : 1.0872;
      tp1 = isBull ? 1.088 : 1.08;
      tp2 = isBull ? 1.092 : 1.076;
      sup = 1.082;
      res = 1.09;
    } else if (assetName.includes("NAS")) {
      entry = 19720;
      sl = 19580;
      tp1 = 19900;
      tp2 = 20100;
      sup = 19600;
      res = 20000;
    } else {
      entry = 1.2741;
      sl = isBull ? 1.271 : 1.277;
      tp1 = isBull ? 1.279 : 1.27;
      tp2 = isBull ? 1.284 : 1.265;
      sup = 1.272;
      res = 1.28;
    }
    const rr = ((Math.abs(tp2 - entry) / Math.abs(sl - entry)) || 1).toFixed(1);

    const news = isBull
      ? [
          {
            text: "<strong>US Dollar Index</strong> weakened following softer-than-expected inflation data, boosting risk appetite.",
            sentiment: "Positive",
          },
          {
            text: `<strong>${assetName}</strong> gaining strength supported by institutional buying and declining treasury yields.`,
            sentiment: "Positive",
          },
        ]
      : [
          {
            text: "<strong>Federal Reserve</strong> hawkish commentary renewed USD strength, weighing on risk assets.",
            sentiment: "Negative",
          },
          {
            text: `<strong>${assetName}</strong> facing headwinds from profit-taking at key resistance levels.`,
            sentiment: "Negative",
          },
        ];

    const cal = [
      { time: "15:30", event: "US CPI (MoM)", impact: "high" },
      { time: "17:00", event: "Fed Member Speech", impact: "medium" },
      { time: "19:00", event: "US Crude Oil Inventories", impact: "medium" },
    ];

    const reasoning = isBull
      ? `Our AI identified a <strong>bullish continuation setup</strong> after detecting weakening USD strength, positive institutional order flow and a confirmed breakout above the key $${sup} support-turned-resistance level. Momentum indicators (RSI at ${Math.floor(
          52 + Math.random() * 12
        )}, MACD bullish crossover) support further upside. Smart money positioning data shows net-long accumulation for the third consecutive session. The upcoming economic events may increase short-term volatility — recommended risk per trade remains at 1% of account capital. Suggested to <strong>trail stop to breakeven</strong> once TP1 is reached.`
      : `Our AI identified a <strong>bearish reversal signal</strong> following deteriorating order flow and a confirmed rejection at the $${res} resistance zone. MACD shows bearish crossover on H4, RSI overbought at ${Math.floor(
          68 + Math.random() * 10
        )}. Institutional data reflects increased short positioning. News sentiment is negative, reinforcing downside probability. Monitor upcoming economic releases for volatility spikes. Recommended risk per trade: 1% of account capital.`;

    return {
      instrument: assetName,
      signal,
      trend,
      confidence: conf,
      entry,
      sl,
      tp1,
      tp2,
      rr: `1 : ${rr}`,
      riskLevel: risk.charAt(0).toUpperCase() + risk.slice(1),
      indicators: {
        rsi: Math.floor(48 + Math.random() * 28),
        macd: isBull ? "Bullish X" : "Bearish X",
        ema: isBull ? "Above 200" : "Below 200",
        atr: "High Vol",
        adx: conf > 85 ? "Very Strong" : "Strong",
      },
      structure: {
        trend,
        liquidity: isBull ? "Buy Side" : "Sell Side",
        support: sup,
        resistance: res,
        flow: isBull ? "Positive" : "Negative",
      },
      news,
      cal,
      reasoning,
      timestamp: new Date().toISOString(),
    };
  }

  function handleCategory(cat: CategoryType) {
    setSelectedCategory(cat);
  }

  function handleType(t: AnalysisType) {
    setSelectedType(t);
  }

  function handleRisk(r: RiskType) {
    setSelectedRisk(r);
  }

  function normalizeInstrument(instrument: string): string {
    if (!instrument) return "";
    return instrument.split(" — ")[0]?.trim() || "";
  }

  function getCryptoStream(instrument: string): string | null {
    const clean = normalizeInstrument(instrument);

    const streams: Record<string, string> = {
      "BTC/USDT": "btcusdt@trade",
      "ETH/USDT": "ethusdt@trade",
      "SOL/USDT": "solusdt@trade",
      "BNB/USDT": "bnbusdt@trade",
      "XRP/USDT": "xrpusdt@trade",
      "DOGE/USDT": "dogeusdt@trade",
      "ADA/USDT": "adausdt@trade",
      "AVAX/USDT": "avaxusdt@trade",
      "EUR/USD": "eurusd",
      "GBP/USD": "gbpusd",
      "USD/JPY": "usdjpy",
      "AUD/USD": "audusd",
      "USD/CAD": "usdcad",
      "USD/CHF": "usdchf",
      "NZD/USD": "nzdusd",
      "XAU/USD": "xauusd",
      "XAG/USD": "xagusd",
      "XPT/USD": "xptusd",
      "XPD/USD": "xpdusd",
      COPPER: "copper",
      US30: "us30",
      NAS100: "nas100",
      SP500: "sp500",
      DAX: "dax",
      FTSE100: "ftse100",
      NIKKEI: "nikkei",
      HSI: "hsi",
      "WTI/USD": "wtiusd",
      "BRENT/USD": "brentusd",
      "NGAS/USD": "ngasusd",
      WHEAT: "wheat",
      CORN: "corn",
      SOYBEANS: "soybeans",
    };
    return streams[clean] || null;
  }

  function calculateTradeLevels(price: number, trend: string = "Bullish"): TradeLevels {
    const entry = Number(price);

    if (!Number.isFinite(entry) || entry <= 0) {
      return {
        entry: null,
        sl: null,
        tp1: null,
        tp2: null,
        rr: null,
      };
    }

    const lossPercent = 0.05;
    const profit1Percent = 0.08;
    const profit2Percent = 0.15;

    const lossDistance = entry * lossPercent;
    const profit1Distance = entry * profit1Percent;
    const profit2Distance = entry * profit2Percent;

    let sl: number, tp1: number, tp2: number;

    if (trend === "Bearish") {
      sl = entry + lossDistance;
      tp1 = entry - profit1Distance;
      tp2 = entry - profit2Distance;
    } else {
      sl = entry - lossDistance;
      tp1 = entry + profit1Distance;
      tp2 = entry + profit2Distance;
    }

    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp1 - entry);
    const rr = risk > 0 ? (reward / risk).toFixed(2) : "0.00";

    return {
      entry,
      sl,
      tp1,
      tp2,
      rr,
    };
  }

  async function fetchGoldPrice(currentTrend: string, currentEntry: number) {
    try {
      const response = await fetch('https://xaus.com/api/v1/spot');
      const data = await response.json();
      const price = data.spot_usd_oz || data.xau?.price;
      
      if (Number.isFinite(price)) {
        setLivePrice(price);
        const levels = calculateTradeLevels(price, currentTrend);
        setTradeLevels(levels);
      }
    } catch (error) {
      console.error('Error fetching gold price:', error);
      if (currentEntry) {
        setLivePrice(currentEntry);
        const levels = calculateTradeLevels(currentEntry, currentTrend);
        setTradeLevels(levels);
      }
    }
  }

  useEffect(() => {
    if (!reportData?.instrument) {
      setLivePrice(null);
      return;
    }

    const assetName = normalizeInstrument(reportData.instrument);
    const isGold = assetName.includes("XAU") || assetName.includes("Gold");
    const isMetal = assetName.includes("XAG") || assetName.includes("Silver") || 
                   assetName.includes("XPT") || assetName.includes("Platinum") ||
                   assetName.includes("XPD") || assetName.includes("Palladium");

    if (isGold || isMetal) {
      fetchGoldPrice(reportData?.trend, reportData?.entry);
      const interval = setInterval(() => fetchGoldPrice(reportData?.trend, reportData?.entry), 30000);
      return () => clearInterval(interval);
    }

    const stream = getCryptoStream(reportData.instrument);

    if (!stream) {
      setLivePrice(reportData.entry);
      const levels = calculateTradeLevels(reportData.entry, reportData?.trend);
      setTradeLevels(levels);
      return;
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);

    ws.onopen = () => {
      console.log("Connected:", stream);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = Number(data.p);

      if (Number.isFinite(price)) {
        setLivePrice(price);
        const levels = calculateTradeLevels(price, reportData?.trend);
        setTradeLevels(levels);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [reportData?.instrument, reportData?.entry, reportData?.trend]);

  useEffect(() => {
    if (!reportData) return;
    loadTradingView(reportData.instrument);
  }, [reportData]);

  function loadTradingView(instrument: string) {
    const container = tvContainerRef.current;
    if (!container) return;

    const cleanInstrument = normalizeInstrument(instrument);
    const symbol = tvMap[cleanInstrument] || "OANDA:XAUUSD";

    container.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";

    widgetContainer.appendChild(widget);
    container.appendChild(widgetContainer);

    const isDark = document.documentElement.classList.contains('dark') || 
                   document.documentElement.getAttribute('data-theme') === 'dark' ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.async = true;

    script.innerHTML = JSON.stringify({
      symbols: [[cleanInstrument, symbol + "|1D"]],
      chartOnly: false,
      width: "100%",
      height: "380",
      locale: "en",
      colorTheme: isDark ? "dark" : "light",
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily:
        "-apple-system,BlinkMacSystemFont,Trebuchet MS,Roboto,Ubuntu,sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "candlesticks",
      maLineColor: "#2962FF",
      maLineWidth: 1,
      maLength: 9,
      headerFontSize: "medium",
      lineWidth: 2,
      lineType: 0,
      dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
    });

    widgetContainer.appendChild(script);
  }

  function renderReport(data: ReportData) {
    setReportData(data);
    setHasReport(true);

    const initialLevels = calculateTradeLevels(data.entry, data.trend);
    setTradeLevels(initialLevels);

    setTimeout(() => {
      const circle = gaugeCircleRef.current;
      const num = confNumRef.current;
      if (circle) {
        const circ = 276.46;
        const offset = circ - circ * (data.confidence / 100);
        circle.style.strokeDashoffset = String(offset);
      }
      if (num) {
        let cn = 0;
        const interval = setInterval(() => {
          cn = Math.min(cn + 2, data.confidence);
          num.textContent = cn + "%";
          if (cn >= data.confidence) clearInterval(interval);
        }, 20);
      }
    }, 200);

    const rt = reasoningRef.current;
    const typing = typingRef.current;
    if (rt && typing) {
      rt.innerHTML = "";
      typing.style.display = "inline-block";
      let idx = 0;
      const raw = data.reasoning;
      const stripped = raw.replace(/<[^>]+>/g, "");
      function typeNext() {
        if (idx < stripped.length) {
          if (rt) {
            rt.innerHTML = stripped.substring(0, idx + 1);
          }
          idx++;
          if (idx < stripped.length) {
            setTimeout(typeNext, idx < 50 ? 30 : idx < 150 ? 18 : 12);
          } else {
            if (rt) {
              rt.innerHTML = raw;
            }
            if (typing) {
              typing.style.display = "none";
            }
          }
        }
      }
      setTimeout(typeNext, 200);
    }
  }

  async function handleGenerate() {
    if (generating) return;
    if (credits <= 0) {
      setShowModal(true);
      return;
    }
    setGenerating(true);
    setHasReport(false);
    setReportData(null);
    setCurrentStep(0);
    setLoadingProgress(0);

    setCredits((c) => Math.max(0, c - 1));

    const totalSteps = loadingSteps.length;

    for (let i = 0; i < totalSteps; i++) {
      setCurrentStep(i);
      const progress = Math.round(((i + 1) / totalSteps) * 100);
      setLoadingProgress(progress);

      const delay = 600 + Math.random() * 600;
      await new Promise((r) => setTimeout(r, delay));
    }

    await new Promise((r) => setTimeout(r, 500));

    const assetEl = document.getElementById("ata-asset") as HTMLSelectElement;
    const asset = assetEl ? assetEl.value : "XAU/USD";
    const data = getMockResponse(
      selectedCategory,
      asset,
      selectedType,
      selectedRisk
    );

    const newEntry: HistoryEntry = {
      date: new Date(),
      instrument: data.instrument,
      category: selectedCategory,
      trend: data.trend,
      confidence: data.confidence,
      credits: 1,
      data,
    };
    setHistory((prev) => [newEntry, ...prev].slice(0, 20));

    renderReport(data);
    setGenerating(false);
  }

  function buyCredits(amount: number) {
    setCredits((c) => c + amount);
  }

  function copyReport() {
    const text = reportRef.current?.innerText || "No report";
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  function loadHistory(index: number) {
    const entry = history[index];
    if (!entry) return;
    setHasReport(true);
    renderReport(entry.data);
  }

  useEffect(() => {
    const clockEl = document.getElementById("ata-clock");
    if (clockEl) {
      const tick = () => {
        const n = new Date();
        clockEl.textContent =
          n.toUTCString().split(" ").slice(4, 5)[0] + " UTC";
      };
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        :root {
          --accent: #1680ff;
          --accent-hover: #0d5ecf;
          --red: #f85149;
          --gold: #d29922;
          --blue: #58a6ff;
        }
        .ata-cat-icon { font-size: 17px; display: block; margin-bottom: 4px; }
        .ata-cat { padding: 9px 6px; background: var(--bg-3); border: 1px solid var(--border); border-radius: 9px; text-align: center; cursor: pointer; transition: all 0.2s; font-size: 11.5px; font-weight: 500; color: var(--text-secondary); }
        .ata-cat:hover { border-color: rgba(22,128,255,0.3); color: var(--text-primary); }
        .ata-cat.sel { background: rgba(22,128,255,0.1); border-color: rgba(22,128,255,0.4); color: var(--accent); font-weight: 600; }
        .ata-type { padding: 9px 10px; background: var(--bg-3); border: 1px solid var(--border); border-radius: 9px; cursor: pointer; transition: all 0.2s; font-size: 11.5px; font-weight: 500; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }
        .ata-type:hover { border-color: rgba(22,128,255,0.3); color: var(--text-primary); }
        .ata-type.sel { background: rgba(22,128,255,0.1); border-color: rgba(22,128,255,0.4); color: var(--accent); font-weight: 600; }
        .ata-risk { flex: 1; padding: 9px; background: var(--bg-3); border: 1px solid var(--border); border-radius: 9px; text-align: center; cursor: pointer; font-size: 12px; font-weight: 500; color: var(--text-secondary); transition: all 0.2s; }
        .ata-risk:hover { border-color: rgba(22,128,255,0.3); }
        .ata-risk.sel-low { background: rgba(22,128,255,0.1); border-color: rgba(22,128,255,0.4); color: var(--accent); }
        .ata-risk.sel-med { background: rgba(210,153,34,0.1); border-color: rgba(210,153,34,0.4); color: var(--gold); }
        .ata-risk.sel-high { background: rgba(248,81,73,0.1); border-color: rgba(248,81,73,0.4); color: var(--red); }
        .ata-gen-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #1680ff, #0d5ecf); color: #fff; border: none; border-radius: 11px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Inter', sans-serif; }
        .ata-gen-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(22,128,255,0.35); }
        .ata-gen-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        .ata-signal-buy { background: rgba(22,128,255,0.15); color: var(--accent); border: 1px solid rgba(22,128,255,0.3); }
        .ata-signal-sell { background: rgba(248,81,73,0.15); color: var(--red); border: 1px solid rgba(248,81,73,0.3); }
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
        @keyframes ata-spin { to { transform: rotate(360deg) } }
        @keyframes ata-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes ata-fadein { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        .ata-typing { display: inline-block; width: 2px; height: 13px; background: var(--accent); animation: blink 1s infinite; border-radius: 1px; margin-left: 3px; }
        .ata-tv-live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); display: inline-block; animation: blink 1.6s infinite; }
        .ata-load-spinner { width: 60px; height: 60px; border-radius: 50%; border: 3px solid rgba(22,128,255,0.15); border-top-color: var(--accent); animation: ata-spin 0.8s linear infinite; position: relative; }
        .ata-load-spinner::after { content: ''; position: absolute; inset: 6px; border-radius: 50%; border: 3px solid rgba(22,128,255,0.15); border-bottom-color: var(--accent); animation: ata-spin 1.2s linear infinite reverse; }
        .ata-load-step { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; font-size: 12.5px; color: var(--text-secondary); transition: all 0.4s; }
        .ata-load-step.done { color: var(--accent); background: rgba(22,128,255,0.06); }
        .ata-load-step.active { color: var(--text-primary); background: var(--bg-hover); font-weight: 500; }
        .ata-load-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; transition: background 0.3s; }
        .ata-load-step.done .ata-load-dot { background: var(--accent); }
        .ata-load-step.active .ata-load-dot { background: var(--accent); animation: blink 0.8s infinite; }
        .ata-progress-fill { height: 100%; background: linear-gradient(90deg,#1680ff,#0d5ecf); border-radius: 2px; width: 0%; transition: width 0.5s ease; }
        .ata-report { background: var(--bg-2); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; display: none; animation: ata-fadein 0.5s ease; box-shadow: var(--shadow-sm); }
        .ata-report.show { display: block; }
        .ata-empty-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(22,128,255,0.1); border: 1px solid rgba(22,128,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 34px; animation: ata-float 3s ease-in-out infinite; }
        .ata-trend-box { padding: 14px; background: var(--bg-3); border-radius: 11px; border: 1px solid var(--border); }
        .ata-level-box { background: var(--bg-3); border-radius: 9px; padding: 11px 8px; text-align: center; border: 1px solid var(--border); }
        .ata-ind-card { background: var(--bg-3); border: 1px solid var(--border); border-radius: 9px; padding: 11px 8px; text-align: center; }
        .ata-section-card { background: var(--bg-3); border: 1px solid var(--border); border-radius: 11px; padding: 14px; }
        .ata-reasoning { background: var(--bg-3); border: 1px solid rgba(22,128,255,0.1); border-radius: 11px; padding: 16px; margin-bottom: 18px; font-size: 13px; line-height: 1.85; color: var(--text-primary); }
        .ata-reasoning-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #1680ff, #0d5ecf); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .ata-high-impact { background: rgba(248,81,73,0.1); color: var(--red); border: 1px solid rgba(248,81,73,0.2); }
        .ata-med-impact { background: rgba(210,153,34,0.1); color: var(--gold); border: 1px solid rgba(210,153,34,0.2); }
        .chip { padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; border: 1px solid var(--border); color: var(--text-secondary); background: var(--bg-3); }
        .cg { color: var(--accent); border-color: rgba(22,128,255,0.2); background: rgba(22,128,255,0.06); }
        .ata-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); z-index: 999; display: none; align-items: center; justify-content: center; }
        .ata-modal-overlay.show { display: flex; }
        .ata-modal { background: var(--bg-2); border: 1px solid rgba(22,128,255,0.2); border-radius: 18px; padding: 34px; max-width: 380px; width: 90%; text-align: center; animation: ata-fadein 0.3s ease; box-shadow: var(--shadow-lg); }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .btn-p { background: var(--accent); color: #fff; }
        .btn-p:hover { background: #0d5ecf; box-shadow: 0 4px 16px rgba(22,128,255,0.3); }
        .btn-s { background: var(--glass); color: var(--text-primary); border: 1px solid var(--border); }
        .btn-s:hover { border-color: var(--border-hover); background: var(--bg-3); }
        .bsm { padding: 6px 11px; font-size: 12px; border-radius: 7px; }
      `}</style>

      <div className="flex flex-col gap-5 p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span id="ata-clock" className="font-mono text-sm text-muted-foreground">--:--:-- UTC</span>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h2 className="font-bold text-lg">✦ Generate AI Market Analysis</h2>
              <p className="text-xs text-muted-foreground mt-1">Configure your request · 1 credit per analysis</p>
            </div>

            {/* Step 1: Category */}
            <div className="p-4 border-b border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Market Category
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(assetMap) as CategoryType[]).map((cat) => (
                  <div
                    key={cat}
                    className={`ata-cat ${selectedCategory === cat ? "sel" : ""}`}
                    onClick={() => handleCategory(cat)}
                  >
                    <span className="ata-cat-icon">
                      {cat === "forex" && "💱"}
                      {cat === "crypto" && "₿"}
                      {cat === "metals" && "🥇"}
                      {cat === "indices" && "📈"}
                      {cat === "commodities" && "🛢"}
                    </span>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Asset */}
            <div className="p-4 border-b border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Choose Asset
              </div>
              <select
                id="ata-asset"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1680ff]"
              >
                {assetMap[selectedCategory]?.map((asset) => (
                  <option key={asset} value={asset.split(" — ")[0]}>
                    {asset}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Analysis Type */}
            <div className="p-4 border-b border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Analysis Type
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "quick" as AnalysisType, label: "Quick Signal", icon: "⚡" },
                  { id: "intraday" as AnalysisType, label: "Intraday", icon: "📊" },
                  { id: "swing" as AnalysisType, label: "Swing Analysis", icon: "🔄" },
                  { id: "scalping" as AnalysisType, label: "Scalping", icon: "⚡" },
                  { id: "position" as AnalysisType, label: "Position Trade", icon: "📋" },
                  { id: "outlook" as AnalysisType, label: "Market Outlook", icon: "🌐" },
                ].map((t) => (
                  <div
                    key={t.id}
                    className={`ata-type ${selectedType === t.id ? "sel" : ""}`}
                    onClick={() => handleType(t.id)}
                  >
                    <span className="text-sm">{t.icon}</span>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Risk */}
            <div className="p-4 border-b border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Risk Preference
              </div>
              <div className="flex gap-2">
                {[
                  { id: "low" as RiskType, label: "Low", emoji: "🟢" },
                  { id: "med" as RiskType, label: "Medium", emoji: "🟡" },
                  { id: "high" as RiskType, label: "High", emoji: "🔴" },
                ].map((r) => (
                  <div
                    key={r.id}
                    className={`ata-risk ${selectedRisk === r.id ? `sel-${r.id}` : ""}`}
                    onClick={() => handleRisk(r.id)}
                  >
                    {r.emoji}
                    <br />
                    <span className="text-xs font-semibold">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3 p-2 bg-muted rounded-lg border border-border">
                <span className="text-xs text-muted-foreground">Credits Required</span>
                <span className="text-sm font-bold text-[#1680ff]">⚡ 1 Credit</span>
              </div>
              <button
                className="ata-gen-btn"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span
                      style={{
                        animation: "ata-spin 0.8s linear infinite",
                        display: "inline-block",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        width: "14px",
                        height: "14px",
                      }}
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                    Generate AI Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Report */}
          <div className="lg:col-span-3">
            {/* Empty State */}
            {!generating && !hasReport && (
              <div className="bg-card border border-border rounded-lg p-10 text-center flex flex-col items-center gap-4">
                <div className="ata-empty-icon">🤖</div>
                <h3 className="font-bold text-lg">Request Your First Analysis</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Configure your market parameters on the left and click{" "}
                  <strong className="text-[#1680ff]">Generate AI Analysis</strong>{" "}
                  to receive institutional-grade intelligence.
                </p>
                <div className="flex gap-8 mt-2 flex-wrap justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-xs text-muted-foreground">Technical Analysis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">📰</div>
                    <div className="text-xs text-muted-foreground">News Sentiment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">📅</div>
                    <div className="text-xs text-muted-foreground">Economic Calendar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🧠</div>
                    <div className="text-xs text-muted-foreground">AI Reasoning</div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {generating && (
              <div className="bg-card border border-[#1680ff]/20 rounded-lg p-10 text-center flex flex-col items-center gap-5">
                <div className="ata-load-spinner"></div>
                <h3 className="font-bold text-lg">Initializing AI Analysis...</h3>
                <div className="flex flex-col gap-2 w-full max-w-md text-left">
                  {loadingSteps.map((label, i) => (
                    <div
                      key={i}
                      className={`ata-load-step ${
                        i < currentStep ? "done" : i === currentStep ? "active" : ""
                      }`}
                    >
                      <span className="ata-load-dot"></span>
                      {label}
                    </div>
                  ))}
                </div>
                <div className="w-full max-w-md h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="ata-progress-fill"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm font-semibold text-[#1680ff]">{loadingProgress}% Complete</div>
              </div>
            )}

            {/* Report */}
            <div className={`ata-report ${hasReport ? "show" : ""}`} ref={reportRef}>
              {reportData && (
                <>
                  <div className="p-5 border-b border-border bg-muted/50 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-[#1680ff]/8 border border-[#1680ff]/20 rounded-full px-4 py-1 text-xs font-semibold text-[#1680ff]">
                        <span className="w-2 h-2 rounded-full bg-[#1680ff]"></span>
                        Analysis Complete
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Generated just now · via Fyntix AI Engine
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">⚡ 1 Credit Used</span>
                      <span className="chip cg text-[10.5px]">
                        {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Chart */}
                    <div className="bg-muted border border-border rounded-lg mb-5 overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <span className="ata-tv-live-dot"></span>
                          Live Market Chart
                        </div>
                        <div className="text-xs text-muted-foreground">Powered by TradingView</div>
                      </div>
                      <div className="p-0 bg-background" ref={tvContainerRef}></div>
                    </div>

                    {/* Instrument + Signal */}
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Instrument
                        </div>
                        <div className="text-2xl font-bold">{reportData.instrument}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          AI Recommendation
                        </div>
                        <span
                          className={`px-4 py-2 rounded-lg text-sm font-bold ${
                            reportData.signal === "BUY"
                              ? "ata-signal-buy"
                              : "ata-signal-sell"
                          }`}
                        >
                          {reportData.signal}
                        </span>
                      </div>
                    </div>

                    {/* Trend + Confidence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="ata-trend-box">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Market Trend
                          </div>
                          <div
                            className="text-xl font-bold"
                            style={{
                              color:
                                reportData.trend === "Bullish"
                                  ? "var(--accent)"
                                  : "var(--red)",
                            }}
                          >
                            {reportData.trend}
                          </div>
                        </div>
                        <div className="ata-trend-box">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Risk Level
                          </div>
                          <div className="text-xl font-bold" style={{ color: "var(--gold)" }}>
                            {reportData.riskLevel}
                          </div>
                        </div>
                        <div className="ata-trend-box">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Risk Reward
                          </div>
                          <div className="text-xl font-bold">{reportData.rr}</div>
                        </div>
                        <div className="ata-trend-box">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Rec. Risk/Trade
                          </div>
                          <div className="text-xl font-bold" style={{ color: "var(--accent)" }}>
                            1%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="relative w-[110px] h-[110px]">
                          <svg width="110" height="110" viewBox="0 0 110 110">
                            <circle
                              cx="55"
                              cy="55"
                              r="44"
                              fill="none"
                              stroke="rgba(255,255,255,0.06)"
                              strokeWidth="8"
                            />
                            <circle
                              ref={gaugeCircleRef}
                              cx="55"
                              cy="55"
                              r="44"
                              fill="none"
                              stroke="url(#ataGrad)"
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray="276.46"
                              strokeDashoffset="276.46"
                              transform="rotate(-90 55 55)"
                              style={{ transition: "stroke-dashoffset 1.4s ease" }}
                            />
                            <defs>
                              <linearGradient id="ataGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#1680ff" />
                                <stop offset="100%" stopColor="#0d5ecf" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-xl font-bold text-[#1680ff]" ref={confNumRef}>
                              {reportData.confidence}%
                            </div>
                            <div className="text-xs text-muted-foreground">Confidence</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trade Levels */}
                    <div className="grid grid-cols-5 gap-2 mb-5">
                      <div className="ata-level-box">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Entry Zone
                        </div>
                        <div className="text-sm font-bold">
                          {tradeLevels.entry !== null
                            ? tradeLevels.entry.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "--"}
                        </div>
                      </div>
                      <div className="ata-level-box" style={{ borderColor: "rgba(248,81,73,0.2)" }}>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Stop Loss
                        </div>
                        <div className="text-sm font-bold" style={{ color: "var(--red)" }}>
                          {tradeLevels.sl !== null
                            ? tradeLevels.sl.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "--"}
                        </div>
                      </div>
                      <div className="ata-level-box" style={{ borderColor: "rgba(7,219,199,0.2)" }}>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Take Profit 1
                        </div>
                        <div className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                          {tradeLevels.tp1 !== null
                            ? tradeLevels.tp1.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "--"}
                        </div>
                      </div>
                      <div className="ata-level-box" style={{ borderColor: "rgba(7,219,199,0.3)" }}>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Take Profit 2
                        </div>
                        <div className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                          {tradeLevels.tp2 !== null
                            ? tradeLevels.tp2.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "--"}
                        </div>
                      </div>
                      <div className="ata-level-box" style={{ borderColor: "rgba(88,166,255,0.2)" }}>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Risk Reward
                        </div>
                        <div className="text-sm font-bold" style={{ color: "var(--blue)" }}>
                          {tradeLevels.rr !== null ? `1:${tradeLevels.rr}` : "--"}
                        </div>
                      </div>
                    </div>

                    {/* Technical Indicators */}
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Technical Indicators
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-5">
                      {[
                        {
                          label: "RSI",
                          value: reportData.indicators.rsi,
                          sub: "Neutral",
                          color:
                            reportData.indicators.rsi > 70
                              ? "var(--red)"
                              : reportData.indicators.rsi < 30
                              ? "var(--accent)"
                              : "var(--gold)",
                        },
                        {
                          label: "MACD",
                          value: reportData.indicators.macd,
                          sub: "Crossover",
                          color: reportData.indicators.macd.includes("Bull")
                            ? "var(--accent)"
                            : "var(--red)",
                        },
                        {
                          label: "EMA",
                          value: reportData.indicators.ema,
                          sub: "Trend",
                          color: reportData.indicators.ema.includes("Above")
                            ? "var(--accent)"
                            : "var(--red)",
                        },
                        {
                          label: "ATR",
                          value: reportData.indicators.atr,
                          sub: "Volatility",
                          color: "var(--gold)",
                        },
                        {
                          label: "ADX",
                          value: reportData.indicators.adx,
                          sub: "Trend Str.",
                          color: "var(--accent)",
                        },
                      ].map((ind, i) => (
                        <div key={i} className="ata-ind-card">
                          <div className="text-xs text-muted-foreground mb-1">{ind.label}</div>
                          <div className="text-xs font-bold mb-1" style={{ color: ind.color }}>
                            {ind.value}
                          </div>
                          <div className="text-xs text-muted-foreground">{ind.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Structure + News */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div className="ata-section-card">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          📐 Market Structure
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Trend</span>
                          <strong
                            style={{
                              color:
                                reportData.structure.trend === "Bullish"
                                  ? "var(--accent)"
                                  : "var(--red)",
                            }}
                          >
                            {reportData.structure.trend}
                          </strong>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Liquidity</span>
                          <strong>{reportData.structure.liquidity}</strong>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Support</span>
                          <strong>{reportData.structure.support}</strong>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Resistance</span>
                          <strong>{reportData.structure.resistance}</strong>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Order Flow</span>
                          <strong
                            style={{
                              color:
                                reportData.structure.flow === "Positive"
                                  ? "var(--accent)"
                                  : "var(--red)",
                            }}
                          >
                            {reportData.structure.flow}
                          </strong>
                        </div>
                      </div>
                      <div className="ata-section-card">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          📰 News Sentiment
                        </div>
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                          style={{
                            background:
                              reportData.signal === "BUY"
                                ? "rgba(7,219,199,0.08)"
                                : "rgba(248,81,73,0.08)",
                            color:
                              reportData.signal === "BUY"
                                ? "var(--accent)"
                                : "var(--red)",
                            border: `1px solid ${
                              reportData.signal === "BUY"
                                ? "rgba(7,219,199,0.2)"
                                : "rgba(248,81,73,0.2)"
                            }`,
                          }}
                        >
                          {reportData.signal === "BUY" ? "● Positive" : "● Negative"} Sentiment
                        </div>
                        {reportData.news.map((n, i) => (
                          <div
                            key={i}
                            className="text-sm text-muted-foreground pb-2 border-b border-border last:border-0 last:pb-0"
                            dangerouslySetInnerHTML={{ __html: n.text }}
                          />
                        ))}
                      </div>
                    </div>

                

                    {/* AI Reasoning */}
                    <div className="ata-reasoning">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="ata-reasoning-avatar">AI</div>
                        <div>
                          <div className="text-sm font-semibold">Fyntix AI Reasoning</div>
                          <div className="text-xs text-muted-foreground">
                            Institutional Analysis Engine
                          </div>
                        </div>
                      </div>
                      <div ref={reasoningRef}></div>
                      <span className="ata-typing" ref={typingRef}></span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap pt-4">
                      <button className="btn btn-s bsm" onClick={copyReport}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Analysis
                      </button>
                      <button className="btn btn-s bsm">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                      </button>
                      <button className="btn btn-p bsm" onClick={handleGenerate}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Generate Again
                      </button>
                      <button className="btn btn-s bsm">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Save Report
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-5 mt-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Previous Reports</h3>
                  <span className="text-xs text-muted-foreground">
                    {history.length} request{history.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3 text-left">
                          Date & Time
                        </th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3 text-left">
                          Instrument
                        </th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3 text-left">
                          Category
                        </th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3 text-left">
                          Trend
                        </th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3 text-left">
                          Confidence
                        </th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3 text-left">
                          Credits
                        </th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3 text-left">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-3 text-sm">
                            {h.date.toLocaleDateString()} {h.date.toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-3 text-sm">
                            <strong>{h.instrument}</strong>
                          </td>
                          <td className="py-3 px-3 text-sm">
                            <span className="chip text-[10.5px] capitalize">{h.category}</span>
                          </td>
                          <td className="py-3 px-3 text-sm">
                            <strong
                              style={{
                                color:
                                  h.trend === "Bullish"
                                    ? "var(--accent)"
                                    : "var(--red)",
                              }}
                            >
                              {h.trend}
                            </strong>
                          </td>
                          <td className="py-3 px-3 text-sm">
                            <strong className="text-[#1680ff]">{h.confidence}%</strong>
                          </td>
                          <td className="py-3 px-3 text-sm" style={{ color: "var(--gold)" }}>
                            ⚡ {h.credits}
                          </td>
                          <td className="py-3 px-3 text-sm">
                            <button
                              className="btn btn-s bsm"
                              onClick={() => loadHistory(i)}
                              style={{ padding: "4px 10px", fontSize: "11px" }}
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className={`ata-modal-overlay ${showModal ? "show" : ""}`}>
        <div className="ata-modal">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="font-bold text-lg mb-2">No AI Credits Available</h3>
          <p className="text-sm text-muted-foreground mb-6">
            You&apos;ve used all your credits. Purchase more credits to continue receiving
            institutional AI market intelligence.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              className="btn btn-p"
              onClick={() => {
                buyCredits(50);
                setShowModal(false);
              }}
            >
              Buy Credits
            </button>
            <button className="btn btn-s" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
