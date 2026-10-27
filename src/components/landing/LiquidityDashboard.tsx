export function LiquidityDashboard() {
  return (
    <div className="liquidity-dashboard-card relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_24px_70px_rgba(37,99,235,0.12)] sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">
            EUR / USDT
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
            Liquidity depth
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-500 shadow-sm">
          <span className="size-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
          Illustrative
        </span>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 px-2 pt-3 sm:px-3">
        <svg
          viewBox="0 0 600 330"
          role="img"
          aria-labelledby="light-liquidity-title light-liquidity-description"
          className="w-full"
        >
          <title id="light-liquidity-title">Illustrative EUR / USDT liquidity chart</title>
          <desc id="light-liquidity-description">
            A rising liquidity depth chart with trade activity bars over a 24-hour timeline. This is
            a visual illustration, not live market data.
          </desc>
          <defs>
            <linearGradient id="light-liquidity-area" x1="0" y1="30" x2="0" y2="235">
              <stop stopColor="#3B82F6" stopOpacity=".24" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="light-liquidity-line" x1="54" y1="170" x2="550" y2="50">
              <stop stopColor="#22C7D9" />
              <stop offset=".55" stopColor="#2585F5" />
              <stop offset="1" stopColor="#7667F5" />
            </linearGradient>
          </defs>
          <g stroke="#CBD5E1" strokeDasharray="3 7" strokeOpacity=".8">
            <path d="M56 42h510M56 88h510M56 134h510M56 180h510M56 226h510" />
          </g>
          <g fill="#64748B" fontFamily="inherit" fontSize="11">
            <text x="8" y="46">
              100
            </text>
            <text x="15" y="92">
              75
            </text>
            <text x="15" y="138">
              50
            </text>
            <text x="15" y="184">
              25
            </text>
          </g>
          <path
            d="M56 188C82 181 92 143 121 150S165 205 198 174 244 112 277 129 320 158 349 108 399 79 430 96 476 126 502 70 535 50 564 48V226H56Z"
            fill="url(#light-liquidity-area)"
          />
          <path
            className="light-liquidity-line-glow"
            pathLength="1"
            d="M56 188C82 181 92 143 121 150S165 205 198 174 244 112 277 129 320 158 349 108 399 79 430 96 476 126 502 70 535 50 564 48"
            fill="none"
            stroke="url(#light-liquidity-line)"
            strokeLinecap="round"
            strokeWidth="9"
          />
          <path
            className="light-liquidity-line"
            pathLength="1"
            d="M56 188C82 181 92 143 121 150S165 205 198 174 244 112 277 129 320 158 349 108 399 79 430 96 476 126 502 70 535 50 564 48"
            fill="none"
            stroke="url(#light-liquidity-line)"
            strokeLinecap="round"
            strokeWidth="3.5"
          />
          <circle className="light-liquidity-point" cx="564" cy="48" r="5" fill="#397DF5" />
          <g className="light-liquidity-bars" fill="#73A9FA">
            <rect x="57" y="263" width="15" height="17" rx="3" />
            <rect x="80" y="255" width="15" height="25" rx="3" />
            <rect x="103" y="267" width="15" height="13" rx="3" />
            <rect x="126" y="250" width="15" height="30" rx="3" />
            <rect x="149" y="258" width="15" height="22" rx="3" />
            <rect x="172" y="246" width="15" height="34" rx="3" />
            <rect x="195" y="268" width="15" height="12" rx="3" />
            <rect x="218" y="257" width="15" height="23" rx="3" />
            <rect x="241" y="242" width="15" height="38" rx="3" />
            <rect x="264" y="260" width="15" height="20" rx="3" />
            <rect x="287" y="249" width="15" height="31" rx="3" />
            <rect x="310" y="255" width="15" height="25" rx="3" />
            <rect x="333" y="237" width="15" height="43" rx="3" />
            <rect x="356" y="251" width="15" height="29" rx="3" />
            <rect x="379" y="244" width="15" height="36" rx="3" />
            <rect x="402" y="258" width="15" height="22" rx="3" />
            <rect x="425" y="235" width="15" height="45" rx="3" />
            <rect x="448" y="249" width="15" height="31" rx="3" />
            <rect x="471" y="232" width="15" height="48" rx="3" />
            <rect x="494" y="242" width="15" height="38" rx="3" />
            <rect x="517" y="226" width="15" height="54" rx="3" />
            <rect x="540" y="235" width="15" height="45" rx="3" />
            <rect x="563" y="220" width="15" height="60" rx="3" />
          </g>
          <g fill="#64748B" fontFamily="inherit" fontSize="11">
            <text x="56" y="306">
              00:00
            </text>
            <text x="183" y="306">
              06:00
            </text>
            <text x="309" y="306">
              12:00
            </text>
            <text x="437" y="306">
              18:00
            </text>
            <text x="543" y="306">
              NOW
            </text>
          </g>
        </svg>
        <div className="flex items-center justify-between border-t border-slate-200 px-1 py-3 text-[10px] text-slate-500 sm:text-xs">
          <span>Liquidity depth · normalized</span>
          <span>Trade activity · 24h</span>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">Pool utilization</span>
          <span className="font-semibold text-blue-600">72%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="light-liquidity-meter h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400" />
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="size-5 shrink-0 text-blue-500"
        >
          <path
            d="M12 3 19 6v5c0 4.5-2.9 8.3-7 10-4.1-1.7-7-5.5-7-10V6l7-3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m9 12 2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Built on established, audited blockchain infrastructure</span>
      </div>
    </div>
  );
}
