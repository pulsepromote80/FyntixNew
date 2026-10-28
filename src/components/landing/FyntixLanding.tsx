"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeLogo } from "@/components/common/ThemeLogo";
import { LiquidityDashboard } from "@/components/landing/LiquidityDashboard";

export default function FyntixLanding() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="bg-ink overflow-clip text-foreground">
      <header className="border-line/80 bg-ink/85 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-between py-3.5">
            <Link className="flex items-center" href="/">
              <ThemeLogo width={1193} height={366} className="h-9 w-auto" />
            </Link>
            <nav className="hidden items-center gap-7 text-sm text-muted lg:flex">
              <a href="#protocol" className="transition hover:text-foreground">
                Protocol
              </a>
              <a href="#architecture" className="transition hover:text-foreground">
                Architecture
              </a>
              <a href="#security" className="transition hover:text-foreground">
                Security
              </a>
              <a href="#roadmap" className="transition hover:text-foreground">
                Roadmap
              </a>
              <a href="#token" className="transition hover:text-foreground">
                Token
              </a>
              <a href="#faq" className="transition hover:text-foreground">
                FAQ
              </a>
            </nav>
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                className="bg-mint text-ink hover:bg-mint/90 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                href="/login"
              >
                Login
              </Link>
              <Link
                className="bg-mint text-ink hover:bg-mint/90 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                href="/register"
              >
                Register
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle theme"
                className="border-line hover:bg-subtle rounded-xl border p-2.5 text-muted transition hover:text-foreground"
              >
                {theme === "dark" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-sun"
                  >
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="m4.93 4.93 1.41 1.41"></path>
                    <path d="m17.66 17.66 1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="m6.34 17.66-1.41 1.41"></path>
                    <path d="m19.07 4.93-1.41 1.41"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-moon"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle theme"
                className="border-line hover:bg-subtle rounded-xl border p-2.5 text-muted transition hover:text-foreground"
              >
                {theme === "dark" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-sun"
                  >
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="m4.93 4.93 1.41 1.41"></path>
                    <path d="m17.66 17.66 1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="m6.34 17.66-1.41 1.41"></path>
                    <path d="m19.07 4.93-1.41 1.41"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-moon"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                  </svg>
                )}
              </button>
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="landing-mobile-menu"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="border-line hover:bg-subtle rounded-lg border p-2 text-foreground transition"
              >
                {mobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="4" x2="20" y1="12" y2="12"></line>
                    <line x1="4" x2="20" y1="6" y2="6"></line>
                    <line x1="4" x2="20" y1="18" y2="18"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <nav
              id="landing-mobile-menu"
              className="border-line/80 grid gap-1 border-t py-3 text-sm text-muted lg:hidden"
            >
              {[
                ["Protocol", "#protocol"],
                ["Architecture", "#architecture"],
                ["Security", "#security"],
                ["Roadmap", "#roadmap"],
                ["Token", "#token"],
                ["FAQ", "#faq"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:bg-subtle rounded-lg px-3 py-2.5 transition hover:text-foreground"
                >
                  {label}
                </a>
              ))}
              <div className="border-line/80 mt-2 flex flex-wrap items-center gap-3 border-t pt-3">
                <Link
                  className="bg-mint text-ink hover:bg-mint/90 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  className="bg-mint text-ink hover:bg-mint/90 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      <section className="page-grid relative">
        <div className="bg-mint/[.07] pointer-events-none absolute left-1/2 top-[-180px] h-[560px] w-[780px] -translate-x-1/2 rounded-full blur-[120px]"></div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-28 lg:pt-28">
          <div className="home-hero-copy">
            <div className="border-line bg-panel/80 mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-muted">
              <span className="bg-mint size-2 rounded-full shadow-[0_0_12px_#1680ff]"></span>
              Decentralised Forex Liquidity Protocol
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-.055em] sm:text-6xl lg:text-7xl">
              Decentralising the{" "}
              <span className="text-gradient">world&apos;s largest financial market.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg">
              FYNTIX connects forex traders and liquidity providers directly through transparent,
              non-custodial smart contracts — replacing broker intermediation with verifiable,
              on-chain execution.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#architecture">
                <button className="bg-mint text-ink hover:bg-mint/90 inline-flex items-center justify-center gap-2 rounded-xl px-4 px-5 py-2.5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50">
                  Explore the Protocol
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-up-right"
                  >
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </button>
              </a>
              <a href="#">
                <button className="border-line bg-panel hover:border-mint/50 inline-flex items-center justify-center gap-2 rounded-xl border px-4 px-5 py-2.5 py-3 text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-50">
                  Read the Litepaper
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </a>
            </div>
            <div className="border-line mt-12 grid max-w-xl grid-cols-3 gap-6 border-t pt-8">
              <div>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  <span>$9.6T</span>
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">Daily global forex volume</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  <span>24</span>
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">Hours market access, every day</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  <span>100%</span>
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">Non-custodial by design</p>
              </div>
            </div>
          </div>
          <div className="home-hero-art relative mx-auto w-full max-w-[500px]">
            <div className="bg-mint/10 absolute inset-10 rounded-full blur-[80px]"></div>

            <div className="relative dark:hidden">
              <LiquidityDashboard />
            </div>
            <div className="glass shadow-glow relative hidden rounded-3xl p-5 dark:block sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted">
                    EUR / USDT
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">Liquidity depth</p>
                </div>
                <span className="border-line bg-panel/70 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-muted">
                  <span className="bg-mint size-1.5 rounded-full"></span>
                  Illustrative
                </span>
              </div>
              <div className="border-line bg-field/70 mt-5 overflow-hidden rounded-2xl border px-2 pt-3 sm:px-3">
                <svg
                  viewBox="0 0 520 265"
                  role="img"
                  aria-labelledby="liquidity-chart-title liquidity-chart-description"
                  className="w-full"
                >
                  <title id="liquidity-chart-title">Illustrative EUR / USDT liquidity chart</title>
                  <desc id="liquidity-chart-description">
                    A rising liquidity depth line with a shaded area and trade activity bars over a
                    24-hour timeline. This is a visual illustration, not live market data.
                  </desc>
                  <defs>
                    <linearGradient
                      id="liquidity-area"
                      x1="0"
                      y1="20"
                      x2="0"
                      y2="190"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#1680ff" stopOpacity=".3"></stop>
                      <stop offset="1" stopColor="#1680ff" stopOpacity="0"></stop>
                    </linearGradient>
                    <linearGradient
                      id="liquidity-stroke"
                      x1="54"
                      y1="150"
                      x2="480"
                      y2="38"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#25c6e8"></stop>
                      <stop offset=".55" stopColor="#1680ff"></stop>
                      <stop offset="1" stopColor="#7d75ff"></stop>
                    </linearGradient>
                    <filter
                      id="liquidity-glow"
                      x="38"
                      y="14"
                      width="465"
                      height="188"
                      colorInterpolationFilters="sRGB"
                      filterUnits="userSpaceOnUse"
                    >
                      <feGaussianBlur stdDeviation="5"></feGaussianBlur>
                    </filter>
                  </defs>
                  <g stroke="var(--line)" strokeOpacity=".75" strokeDasharray="3 6">
                    <path d="M52 30h450M52 70h450M52 110h450M52 150h450M52 190h450"></path>
                    <path d="M52 30v160M164 30v160M277 30v160M389 30v160M502 30v160"></path>
                  </g>
                  <g fill="var(--muted)" fontFamily="inherit" fontSize="9">
                    <text x="7" y="33">
                      100
                    </text>
                    <text x="12" y="73">
                      75
                    </text>
                    <text x="12" y="113">
                      50
                    </text>
                    <text x="12" y="153">
                      25
                    </text>
                    <text x="52" y="207">
                      00:00
                    </text>
                    <text x="157" y="207">
                      06:00
                    </text>
                    <text x="270" y="207">
                      12:00
                    </text>
                    <text x="382" y="207">
                      18:00
                    </text>
                    <text x="474" y="207">
                      NOW
                    </text>
                  </g>
                  <path
                    d="M52 151C72 145 77 119 98 126S128 163 152 143 185 99 208 111 244 134 264 98 304 75 329 88 367 111 388 68 430 48 478 38V190H52Z"
                    fill="url(#liquidity-area)"
                  ></path>
                  <path
                    d="M52 151C72 145 77 119 98 126S128 163 152 143 185 99 208 111 244 134 264 98 304 75 329 88 367 111 388 68 430 48 478 38"
                    pathLength="1"
                    fill="none"
                    stroke="url(#liquidity-stroke)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    filter="url(#liquidity-glow)"
                    opacity=".42"
                  ></path>
                  <path
                    d="M52 151C72 145 77 119 98 126S128 163 152 143 185 99 208 111 244 134 264 98 304 75 329 88 367 111 388 68 430 48 478 38"
                    pathLength="1"
                    fill="none"
                    stroke="url(#liquidity-stroke)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="home-liquidity-line"
                  ></path>
                  <circle
                    cx="478"
                    cy="38"
                    r="9"
                    fill="#1680ff"
                    fillOpacity=".22"
                    className="home-liquidity-pulse"
                  ></circle>
                  <circle
                    cx="478"
                    cy="38"
                    r="4"
                    fill="#1680ff"
                    stroke="var(--panel)"
                    strokeWidth="2"
                  ></circle>
                  <g transform="translate(0 23)" fill="#1680ff" fillOpacity=".55">
                    <rect x="54" y="222" width="13" height="12" rx="2"></rect>
                    <rect x="73" y="218" width="13" height="16" rx="2"></rect>
                    <rect x="92" y="225" width="13" height="9" rx="2"></rect>
                    <rect x="111" y="214" width="13" height="20" rx="2"></rect>
                    <rect x="130" y="219" width="13" height="15" rx="2"></rect>
                    <rect x="149" y="211" width="13" height="23" rx="2"></rect>
                    <rect x="168" y="224" width="13" height="10" rx="2"></rect>
                    <rect x="187" y="216" width="13" height="18" rx="2"></rect>
                    <rect x="206" y="208" width="13" height="26" rx="2"></rect>
                    <rect x="225" y="220" width="13" height="14" rx="2"></rect>
                    <rect x="244" y="213" width="13" height="21" rx="2"></rect>
                    <rect x="263" y="217" width="13" height="17" rx="2"></rect>
                    <rect x="282" y="205" width="13" height="29" rx="2"></rect>
                    <rect x="301" y="214" width="13" height="20" rx="2"></rect>
                    <rect x="320" y="209" width="13" height="25" rx="2"></rect>
                    <rect x="339" y="218" width="13" height="16" rx="2"></rect>
                    <rect x="358" y="204" width="13" height="30" rx="2"></rect>
                    <rect x="377" y="212" width="13" height="22" rx="2"></rect>
                    <rect x="396" y="201" width="13" height="33" rx="2"></rect>
                    <rect x="415" y="208" width="13" height="26" rx="2"></rect>
                    <rect x="434" y="198" width="13" height="36" rx="2"></rect>
                    <rect x="453" y="205" width="13" height="29" rx="2"></rect>
                    <rect x="472" y="194" width="13" height="40" rx="2"></rect>
                  </g>
                </svg>
                <div className="border-line flex items-center justify-between border-t px-1 py-3 text-[10px] text-muted">
                  <span>Liquidity depth · normalized</span>
                  <span>Trade activity · 24h</span>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted">Pool utilization</span>
                  <span className="text-mint font-semibold">72%</span>
                </div>
                <div className="bg-subtle h-2 overflow-hidden rounded-full">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400"></div>
                </div>
              </div>
              <div className="border-line bg-field mt-5 flex items-center gap-2 rounded-xl border p-3 text-xs text-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield-check text-mint shrink-0"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                Built on established, audited blockchain infrastructure
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-line bg-panel border-y">
        <div
          className="scroll-reveal is-visible mx-auto max-w-7xl"
          style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-8 text-sm text-muted lg:px-8">
            <span className="flex items-center gap-2">
              <span className="text-mint">◆</span>Binance Smart Chain
            </span>
            <span className="flex items-center gap-2">
              <span className="text-mint">◇</span>WalletConnect
            </span>
            <span className="flex items-center gap-2">
              <span className="text-mint">◆</span>Trust Wallet
            </span>
            <span className="flex items-center gap-2">
              <span className="text-mint">◇</span>MetaMask
            </span>
            <span className="flex items-center gap-2">
              <span className="text-mint">◆</span>Chainlink Oracles
            </span>
            <span className="flex items-center gap-2">
              <span className="text-mint">◇</span>OpenZeppelin
            </span>
          </div>
        </div>
      </section>

      <section id="protocol" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="max-w-xl">
              <p className="text-mint text-xs font-bold uppercase tracking-[.22em]">About FYNTIX</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                A market built on trust, not intermediaries
              </h2>
              <p className="mt-4 leading-7 text-muted">
                Traditional forex depends on brokers, custodians and clearing houses that sit
                between every trade. FYNTIX replaces that layer with smart contracts that execute,
                settle and record trades directly on-chain — visible to anyone, controlled by no
                one.
              </p>
            </div>
            <div
              className="scroll-reveal is-visible border-line mt-10 space-y-6 border-l pl-6"
              style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
            >
              <div className="relative">
                <span className="bg-mint absolute -left-[31px] top-1.5 size-2.5 rounded-full shadow-[0_0_12px_#1680ff]"></span>
                <p className="text-mint text-xs font-bold uppercase tracking-[.16em]">2026 Q2</p>
                <h4 className="mt-1 font-semibold">Protocol design &amp; audit</h4>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Smart contract architecture specified and submitted for third-party audit.
                </p>
              </div>
              <div className="relative">
                <span className="bg-mint absolute -left-[31px] top-1.5 size-2.5 rounded-full shadow-[0_0_12px_#1680ff]"></span>
                <p className="text-mint text-xs font-bold uppercase tracking-[.16em]">2026 Q4</p>
                <h4 className="mt-1 font-semibold">Public bug bounty</h4>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Open security review by independent researchers ahead of mainnet.
                </p>
              </div>
              <div className="relative">
                <span className="bg-mint absolute -left-[31px] top-1.5 size-2.5 rounded-full shadow-[0_0_12px_#1680ff]"></span>
                <p className="text-mint text-xs font-bold uppercase tracking-[.16em]">2027 Q1</p>
                <h4 className="mt-1 font-semibold">Mainnet &amp; wallet launch</h4>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Non-custodial trading wallet and liquidity protocol go live.
                </p>
              </div>
            </div>
          </div>
          <div
            className="scroll-reveal is-visible"
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            <div className="glass rounded-3xl p-6 sm:p-9">
              <div className="landing-illustration h-56 sm:h-64">
                <img
                  src="/images/protocol-network.svg"
                  alt="Illustration of the decentralized protocol network connecting traders, wallets, and liquidity"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-center text-xs font-semibold uppercase tracking-[.14em]">
                <span className="border-line bg-panel flex-1 rounded-xl border p-4">Traders</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-right text-mint shrink-0"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                <span className="bg-mint text-ink flex-1 rounded-xl p-4">DFL Protocol</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-right text-mint shrink-0"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                <span className="border-line bg-panel flex-1 rounded-xl border p-4">Liquidity</span>
              </div>
              <p className="mt-6 text-center text-sm leading-6 text-muted">
                Peer-to-contract routing — no intermediary bank sits between traders and liquidity
                providers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-line bg-panel border-y">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-mint text-xs font-bold uppercase tracking-[.22em]">The Problem</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Why legacy forex infrastructure is under pressure
            </h2>
            <p className="mt-4 leading-7 text-muted">
              Retail traders remain exposed to structural friction that on-chain architecture is
              built to remove.
            </p>
          </div>
          <div
            className="scroll-reveal is-visible mt-12 grid gap-4 md:grid-cols-2"
            style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
          >
            <div className="border-line bg-panel/60 rounded-2xl border p-7">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-ban"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m4.9 4.9 14.2 14.2"></path>
                </svg>
                Legacy Forex
              </h3>
              <dl className="divide-line/70 mt-6 divide-y">
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Architecture</dt>
                  <dd className="text-right">Intermediary banks &amp; brokers</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Market access</dt>
                  <dd className="text-right">Restricted trading hours</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Custody</dt>
                  <dd className="text-right">Broker-held deposits</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Settlement</dt>
                  <dd className="text-right">Delayed, human-dependent</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Pricing</dt>
                  <dd className="text-right">Opaque, prone to manipulation</dd>
                </div>
              </dl>
            </div>
            <div className="border-mint/40 bg-panel/60 shadow-glow rounded-2xl border p-7">
              <h3 className="text-mint flex items-center gap-2 text-lg font-semibold">
                <span>◆</span>
                FYNTIX Protocol
              </h3>
              <dl className="divide-line/70 mt-6 divide-y">
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Architecture</dt>
                  <dd className="flex items-center gap-2 text-right">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check text-mint shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    Smart contracts &amp; on-chain pools
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Market access</dt>
                  <dd className="flex items-center gap-2 text-right">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check text-mint shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    24/7 global, continuous
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Custody</dt>
                  <dd className="flex items-center gap-2 text-right">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check text-mint shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    100% wallet-controlled
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Settlement</dt>
                  <dd className="flex items-center gap-2 text-right">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check text-mint shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    Near-instant, on-chain
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted">Pricing</dt>
                  <dd className="flex items-center gap-2 text-right">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check text-mint shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    Transparent, peer-to-peer
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section id="architecture" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-mint text-xs font-bold uppercase tracking-[.22em]">
            Protocol Architecture
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            How a trade moves through FYNTIX
          </h2>
          <p className="mt-4 leading-7 text-muted">
            Every transaction is signed by the wallet owner, validated by contract logic, and
            permanently recorded on-chain — in this order, every time.
          </p>
        </div>
        <div
          className="scroll-reveal is-visible trade-flow-visual border-line bg-ink/50 mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border px-3 py-2 sm:px-8"
          style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
        >
          <div className="landing-illustration h-52 sm:h-64">
            <img
              alt="A transaction flow from a signed wallet request through contract validation to direct on-chain settlement"
              loading="lazy"
              decoding="async"
              data-nimg="fill"
              className="object-contain"
              style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                color: "transparent",
              }}
              src="/images/trade-flow.svg"
            />
          </div>
        </div>
        <div
          className="scroll-reveal is-visible mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
        >
          <div className="border-line bg-panel/60 hover:border-mint/40 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
            <div className="landing-illustration architecture-step-art -mx-2 -mt-2 mb-4 h-28 transition-transform duration-700 group-hover:scale-[1.04]">
              <img
                alt="Connect wallet animated illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/wallet-connect.svg"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-mint/10 text-mint grid size-11 place-items-center rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-wallet"
                >
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                </svg>
              </span>
              <span className="text-3xl font-semibold text-muted/20">01</span>
            </div>
            <h5 className="mt-5 font-semibold">Connect wallet</h5>
            <p className="mt-2 text-sm leading-6 text-muted">User links a non-custodial wallet</p>
          </div>
          <div className="border-line bg-panel/60 hover:border-mint/40 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
            <div className="landing-illustration architecture-step-art -mx-2 -mt-2 mb-4 h-28 transition-transform duration-700 group-hover:scale-[1.04]">
              <img
                alt="Sign transaction animated illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/sign-transaction.svg"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-mint/10 text-mint grid size-11 place-items-center rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pen-line"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"></path>
                </svg>
              </span>
              <span className="text-3xl font-semibold text-muted/20">02</span>
            </div>
            <h5 className="mt-5 font-semibold">Sign transaction</h5>
            <p className="mt-2 text-sm leading-6 text-muted">
              Cryptographic signature authorises intent
            </p>
          </div>
          <div className="border-line bg-panel/60 hover:border-mint/40 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
            <div className="landing-illustration architecture-step-art -mx-2 -mt-2 mb-4 h-28 transition-transform duration-700 group-hover:scale-[1.04]">
              <img
                alt="Secure bridge animated illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/protocol-network.svg"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-mint/10 text-mint grid size-11 place-items-center rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-link2"
                >
                  <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                  <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                  <line x1="8" x2="16" y1="12" y2="12"></line>
                </svg>
              </span>
              <span className="text-3xl font-semibold text-muted/20">03</span>
            </div>
            <h5 className="mt-5 font-semibold">Secure bridge</h5>
            <p className="mt-2 text-sm leading-6 text-muted">
              Encrypted session to the protocol layer
            </p>
          </div>
          <div className="border-line bg-panel/60 hover:border-mint/40 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
            <div className="landing-illustration architecture-step-art -mx-2 -mt-2 mb-4 h-28 transition-transform duration-700 group-hover:scale-[1.04]">
              <img
                alt="Smart contract animated illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/trade-flow.svg"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-mint/10 text-mint grid size-11 place-items-center rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-file-code2"
                >
                  <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"></path>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                  <path d="m5 12-3 3 3 3"></path>
                  <path d="m9 18 3-3-3-3"></path>
                </svg>
              </span>
              <span className="text-3xl font-semibold text-muted/20">04</span>
            </div>
            <h5 className="mt-5 font-semibold">Smart contract</h5>
            <p className="mt-2 text-sm leading-6 text-muted">Logic engine receives the request</p>
          </div>
          <div className="border-line bg-panel/60 hover:border-mint/40 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
            <div className="landing-illustration architecture-step-art -mx-2 -mt-2 mb-4 h-28 transition-transform duration-700 group-hover:scale-[1.04]">
              <img
                alt="Risk validation animated illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/wallet-security.svg"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-mint/10 text-mint grid size-11 place-items-center rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield-check"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </span>
              <span className="text-3xl font-semibold text-muted/20">05</span>
            </div>
            <h5 className="mt-5 font-semibold">Risk validation</h5>
            <p className="mt-2 text-sm leading-6 text-muted">
              Automated checkpoint verifies parameters
            </p>
          </div>
          <div className="border-line bg-panel/60 hover:border-mint/40 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
            <div className="landing-illustration architecture-step-art -mx-2 -mt-2 mb-4 h-28 transition-transform duration-700 group-hover:scale-[1.04]">
              <img
                alt="Liquidity pool animated illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/market-flow.svg"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-mint/10 text-mint grid size-11 place-items-center rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-droplets"
                >
                  <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path>
                  <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"></path>
                </svg>
              </span>
              <span className="text-3xl font-semibold text-muted/20">06</span>
            </div>
            <h5 className="mt-5 font-semibold">Liquidity pool</h5>
            <p className="mt-2 text-sm leading-6 text-muted">
              Capital is accessed from on-chain pools
            </p>
          </div>
          <div className="border-line bg-panel/60 hover:border-mint/40 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
            <div className="landing-illustration architecture-step-art -mx-2 -mt-2 mb-4 h-28 transition-transform duration-700 group-hover:scale-[1.04]">
              <img
                alt="Chain confirmation animated illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/protocol-network.svg"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-mint/10 text-mint grid size-11 place-items-center rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-boxes"
                >
                  <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"></path>
                  <path d="m7 16.5-4.74-2.85"></path>
                  <path d="m7 16.5 5-3"></path>
                  <path d="M7 16.5v5.17"></path>
                  <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"></path>
                  <path d="m17 16.5-5-3"></path>
                  <path d="m17 16.5 4.74-2.85"></path>
                  <path d="M17 16.5v5.17"></path>
                  <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"></path>
                  <path d="M12 8 7.26 5.15"></path>
                  <path d="m12 8 4.74-2.85"></path>
                  <path d="M12 13.5V8"></path>
                </svg>
              </span>
              <span className="text-3xl font-semibold text-muted/20">07</span>
            </div>
            <h5 className="mt-5 font-semibold">Chain confirmation</h5>
            <p className="mt-2 text-sm leading-6 text-muted">Block confirmation on the network</p>
          </div>
          <div className="border-line bg-panel/60 hover:border-mint/40 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
            <div className="landing-illustration architecture-step-art -mx-2 -mt-2 mb-4 h-28 transition-transform duration-700 group-hover:scale-[1.04]">
              <img
                alt="Transaction hash animated illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/sign-transaction.svg"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-mint/10 text-mint grid size-11 place-items-center rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-hash"
                >
                  <line x1="4" x2="20" y1="9" y2="9"></line>
                  <line x1="4" x2="20" y1="15" y2="15"></line>
                  <line x1="10" x2="8" y1="3" y2="21"></line>
                  <line x1="16" x2="14" y1="3" y2="21"></line>
                </svg>
              </span>
              <span className="text-3xl font-semibold text-muted/20">08</span>
            </div>
            <h5 className="mt-5 font-semibold">Transaction hash</h5>
            <p className="mt-2 text-sm leading-6 text-muted">
              Verifiable receipt written to the ledger
            </p>
          </div>
          <div className="border-line bg-panel/60 hover:border-mint/40 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
            <div className="landing-illustration architecture-step-art -mx-2 -mt-2 mb-4 h-28 transition-transform duration-700 group-hover:scale-[1.04]">
              <img
                alt="Settlement animated illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/trade-flow.svg"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-mint/10 text-mint grid size-11 place-items-center rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-check-check"
                >
                  <path d="M18 6 7 17l-5-5"></path>
                  <path d="m22 10-7.5 7.5L13 16"></path>
                </svg>
              </span>
              <span className="text-3xl font-semibold text-muted/20">09</span>
            </div>
            <h5 className="mt-5 font-semibold">Settlement</h5>
            <p className="mt-2 text-sm leading-6 text-muted">Funds move directly to the wallet</p>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-mint text-xs font-bold uppercase tracking-[.22em]">
            Security Architecture
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Enterprise-grade security, held by the user
          </h2>
          <p className="mt-4 leading-7 text-muted">
            FYNTIX never stores private keys. Every layer of the stack is designed so that ownership
            of funds never leaves the wallet holder.
          </p>
        </div>
        <div
          className="scroll-reveal is-visible mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
        >
          <div className="border-line bg-panel/50 hover:border-mint/40 overflow-hidden rounded-2xl border transition hover:-translate-y-1">
            <div className="landing-illustration h-32 px-5 pt-3">
              <img
                alt="Non-custodial wallet security illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/wallet-security.svg"
              />
            </div>
            <div className="flex gap-4 p-6 pt-2">
              <span className="border-line text-mint grid size-11 shrink-0 place-items-center rounded-xl border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-key-round"
                >
                  <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                  <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                </svg>
              </span>
              <div>
                <h4 className="font-semibold">Non-custodial wallet</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Keys remain on the owner&apos;s device at all times.
                </p>
              </div>
            </div>
          </div>
          <div className="border-line bg-panel/50 hover:border-mint/40 overflow-hidden rounded-2xl border transition hover:-translate-y-1">
            <div className="landing-illustration h-32 px-5 pt-3">
              <img
                alt="Immutable smart contracts security illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/protocol-network.svg"
              />
            </div>
            <div className="flex gap-4 p-6 pt-2">
              <span className="border-line text-mint grid size-11 shrink-0 place-items-center rounded-xl border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-file-lock2"
                >
                  <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v1"></path>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                  <rect width="8" height="5" x="2" y="13" rx="1"></rect>
                  <path d="M8 13v-2a2 2 0 1 0-4 0v2"></path>
                </svg>
              </span>
              <div>
                <h4 className="font-semibold">Immutable smart contracts</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Deployed logic cannot be altered post-launch.
                </p>
              </div>
            </div>
          </div>
          <div className="border-line bg-panel/50 hover:border-mint/40 overflow-hidden rounded-2xl border transition hover:-translate-y-1">
            <div className="landing-illustration h-32 px-5 pt-3">
              <img
                alt="End-to-end encryption security illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/wallet-security.svg"
              />
            </div>
            <div className="flex gap-4 p-6 pt-2">
              <span className="border-line text-mint grid size-11 shrink-0 place-items-center rounded-xl border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-lock"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <div>
                <h4 className="font-semibold">End-to-end encryption</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Session data is encrypted between wallet and protocol.
                </p>
              </div>
            </div>
          </div>
          <div className="border-line bg-panel/50 hover:border-mint/40 overflow-hidden rounded-2xl border transition hover:-translate-y-1">
            <div className="landing-illustration h-32 px-5 pt-3">
              <img
                alt="Multi-signature verification security illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/protocol-network.svg"
              />
            </div>
            <div className="flex gap-4 p-6 pt-2">
              <span className="border-line text-mint grid size-11 shrink-0 place-items-center rounded-xl border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-fingerprint"
                >
                  <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"></path>
                  <path d="M14 13.12c0 2.38 0 6.38-1 8.88"></path>
                  <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"></path>
                  <path d="M2 12a10 10 0 0 1 18-6"></path>
                  <path d="M2 16h.01"></path>
                  <path d="M21.8 16c.2-2 .131-5.354 0-6"></path>
                  <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"></path>
                  <path d="M8.65 22c.21-.66.45-1.32.57-2"></path>
                  <path d="M9 6.8a6 6 0 0 1 9 5.2v2"></path>
                </svg>
              </span>
              <div>
                <h4 className="font-semibold">Multi-signature verification</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Critical protocol actions require multiple approvals.
                </p>
              </div>
            </div>
          </div>
          <div className="border-line bg-panel/50 hover:border-mint/40 overflow-hidden rounded-2xl border transition hover:-translate-y-1">
            <div className="landing-illustration h-32 px-5 pt-3">
              <img
                alt="Public transaction hash security illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/market-flow.svg"
              />
            </div>
            <div className="flex gap-4 p-6 pt-2">
              <span className="border-line text-mint grid size-11 shrink-0 place-items-center rounded-xl border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-hash"
                >
                  <line x1="4" x2="20" y1="9" y2="9"></line>
                  <line x1="4" x2="20" y1="15" y2="15"></line>
                  <line x1="10" x2="8" y1="3" y2="21"></line>
                  <line x1="16" x2="14" y1="3" y2="21"></line>
                </svg>
              </span>
              <div>
                <h4 className="font-semibold">Public transaction hash</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Every settlement is independently verifiable.
                </p>
              </div>
            </div>
          </div>
          <div className="border-line bg-panel/50 hover:border-mint/40 overflow-hidden rounded-2xl border transition hover:-translate-y-1">
            <div className="landing-illustration h-32 px-5 pt-3">
              <img
                alt="Real-time settlement security illustration"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/market-flow.svg"
              />
            </div>
            <div className="flex gap-4 p-6 pt-2">
              <span className="border-line text-mint grid size-11 shrink-0 place-items-center rounded-xl border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-zap"
                >
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
              </span>
              <div>
                <h4 className="font-semibold">Real-time settlement</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  On-chain finality with no delayed clearing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="roadmap"
        className="relative mx-auto max-w-7xl overflow-hidden px-5 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-mint text-xs font-bold uppercase tracking-[.22em]">Roadmap</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Path to a fully decentralised protocol
          </h2>
          <p className="mt-4 leading-7 text-muted">
            Milestones are sequenced around security first: audits and public bug bounties precede
            every major release.
          </p>
        </div>
        <div className="roadmap-backdrop" aria-hidden="true">
          <div className="landing-illustration h-full w-full">
            <img
              alt=""
              loading="lazy"
              decoding="async"
              data-nimg="fill"
              className="object-contain"
              style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                color: "transparent",
              }}
              src="/images/roadmap-trail.svg"
            />
          </div>
        </div>
        <div
          className="scroll-reveal is-visible roadmap-cards relative z-10 mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5"
          style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
        >
          <div className="border-line bg-panel/75 hover:border-mint/40 relative rounded-2xl border p-6 backdrop-blur-md transition hover:-translate-y-1">
            <p className="text-mint flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em]">
              <span className="bg-mint size-2 rounded-full shadow-[0_0_12px_#1680ff]"></span>
              JUN 2026
            </p>
            <h4 className="mt-4 font-semibold">Pre-launch</h4>
            <p className="mt-2 text-sm leading-6 text-muted">
              Community seed initialisation and protocol specification.
            </p>
          </div>
          <div className="border-line bg-panel/75 hover:border-mint/40 relative rounded-2xl border p-6 backdrop-blur-md transition hover:-translate-y-1">
            <p className="text-mint flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em]">
              <span className="bg-mint/40 size-2 rounded-full"></span>
              NOV 2026
            </p>
            <h4 className="mt-4 font-semibold">Bug bounty</h4>
            <p className="mt-2 text-sm leading-6 text-muted">
              Independent developer audit of the DFL protocol contracts.
            </p>
          </div>
          <div className="border-line bg-panel/75 hover:border-mint/40 relative rounded-2xl border p-6 backdrop-blur-md transition hover:-translate-y-1">
            <p className="text-mint flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em]">
              <span className="bg-mint/40 size-2 rounded-full"></span>
              JAN 2027
            </p>
            <h4 className="mt-4 font-semibold">Mainnet launch</h4>
            <p className="mt-2 text-sm leading-6 text-muted">
              Core protocol and wallet go live for public use.
            </p>
          </div>
          <div className="border-line bg-panel/75 hover:border-mint/40 relative rounded-2xl border p-6 backdrop-blur-md transition hover:-translate-y-1">
            <p className="text-mint flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em]">
              <span className="bg-mint/40 size-2 rounded-full"></span>
              MAR 2027
            </p>
            <h4 className="mt-4 font-semibold">Ecosystem integration</h4>
            <p className="mt-2 text-sm leading-6 text-muted">
              Decentralised wallet and lending suite deployment, followed by a further bounty.
            </p>
          </div>
          <div className="border-line bg-panel/75 hover:border-mint/40 relative rounded-2xl border p-6 backdrop-blur-md transition hover:-translate-y-1">
            <p className="text-mint flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em]">
              <span className="bg-mint/40 size-2 rounded-full"></span>
              AUG 2027
            </p>
            <h4 className="mt-4 font-semibold">Full decentralisation</h4>
            <p className="mt-2 text-sm leading-6 text-muted">
              Target: the complete DFL ecosystem operating without centralised control points.
            </p>
          </div>
        </div>
      </section>

      <section
        id="token"
        className="token-section border-line bg-panel relative overflow-hidden border-y"
      >
        <div className="token-section-glow" aria-hidden="true"></div>
        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-mint text-xs font-bold uppercase tracking-[.22em]">Token Utility</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              What the FYNTIX token is for
            </h2>
            <p className="mt-4 leading-7 text-muted">
              The token&apos;s role is functional — it powers the mechanics of the protocol itself, not a
              promise of return.
            </p>
          </div>
          <div
            className="scroll-reveal is-visible token-feature border-mint/25 bg-ink/70 shadow-glow mt-12 grid items-center gap-5 overflow-hidden rounded-3xl border p-5 sm:p-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-10"
            style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
          >
            <div className="landing-illustration token-coin-art h-64 sm:h-72">
              <img
                alt="Blue FYNTIX token coin illustration representing protocol utility"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                className="object-contain"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/images/token-core.svg"
              />
            </div>
            <div className="token-feature-copy px-2 py-3 sm:px-4">
              <p className="text-mint flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em]">
                <span className="bg-mint size-2 rounded-full shadow-[0_0_12px_#1680ff]"></span>
                Designed for utility
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                One token. Four protocol functions.
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                From settling fees to community governance, token utility is built into how the
                ecosystem works.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="token-function-chip border-line bg-panel/50 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium">
                  <span className="text-mint">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-coins"
                    >
                      <circle cx="8" cy="8" r="6"></circle>
                      <path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path>
                      <path d="M7 6h1v4"></path>
                      <path d="m16.71 13.88.7.71-2.82 2.82"></path>
                    </svg>
                  </span>
                  <span>
                    <span className="text-mint/70 mr-1">01</span>Protocol Transactions
                  </span>
                </div>
                <div className="token-function-chip border-line bg-panel/50 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium">
                  <span className="text-mint">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-droplets"
                    >
                      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path>
                      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"></path>
                    </svg>
                  </span>
                  <span>
                    <span className="text-mint/70 mr-1">02</span>Liquidity Incentives
                  </span>
                </div>
                <div className="token-function-chip border-line bg-panel/50 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium">
                  <span className="text-mint">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-vote"
                    >
                      <path d="m9 12 2 2 4-4"></path>
                      <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                      <path d="M22 19H2"></path>
                    </svg>
                  </span>
                  <span>
                    <span className="text-mint/70 mr-1">03</span>Governance Participation
                  </span>
                </div>
                <div className="token-function-chip border-line bg-panel/50 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium">
                  <span className="text-mint">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-receipt"
                    >
                      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path>
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                      <path d="M12 17.5v-11"></path>
                    </svg>
                  </span>
                  <span>
                    <span className="text-mint/70 mr-1">04</span>Fee Settlement
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 flex items-center gap-4">
            <span className="bg-line h-px flex-1"></span>
            <span className="text-xs font-bold uppercase tracking-[.2em] text-muted">
              Token utility
            </span>
            <span className="bg-line h-px flex-1"></span>
          </div>
          <div
            className="scroll-reveal is-visible mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
          >
            <div className="token-utility-card border-line bg-panel/60 hover:border-mint/50 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
              <span className="token-card-index">01</span>
              <span className="border-mint/20 bg-mint/10 text-mint group-hover:bg-mint group-hover:text-ink grid size-11 place-items-center rounded-xl border transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-coins"
                >
                  <circle cx="8" cy="8" r="6"></circle>
                  <path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path>
                  <path d="M7 6h1v4"></path>
                  <path d="m16.71 13.88.7.71-2.82 2.82"></path>
                </svg>
              </span>
              <h4 className="mt-5 font-semibold">Protocol Transactions</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Used for seamless, efficient operation across the protocol.
              </p>
              <div className="bg-mint/60 mt-5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            </div>
            <div className="token-utility-card border-line bg-panel/60 hover:border-mint/50 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
              <span className="token-card-index">02</span>
              <span className="border-mint/20 bg-mint/10 text-mint group-hover:bg-mint group-hover:text-ink grid size-11 place-items-center rounded-xl border transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-droplets"
                >
                  <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path>
                  <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"></path>
                </svg>
              </span>
              <h4 className="mt-5 font-semibold">Liquidity Incentives</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Directs incentives toward participants who deepen market liquidity.
              </p>
              <div className="bg-mint/60 mt-5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            </div>
            <div className="token-utility-card border-line bg-panel/60 hover:border-mint/50 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
              <span className="token-card-index">03</span>
              <span className="border-mint/20 bg-mint/10 text-mint group-hover:bg-mint group-hover:text-ink grid size-11 place-items-center rounded-xl border transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-vote"
                >
                  <path d="m9 12 2 2 4-4"></path>
                  <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                  <path d="M22 19H2"></path>
                </svg>
              </span>
              <h4 className="mt-5 font-semibold">Governance Participation</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Lets holders take part in decisions about the protocol&apos;s future.
              </p>
              <div className="bg-mint/60 mt-5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            </div>
            <div className="token-utility-card border-line bg-panel/60 hover:border-mint/50 group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1">
              <span className="token-card-index">04</span>
              <span className="border-mint/20 bg-mint/10 text-mint group-hover:bg-mint group-hover:text-ink grid size-11 place-items-center rounded-xl border transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-receipt"
                >
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path>
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                  <path d="M12 17.5v-11"></path>
                </svg>
              </span>
              <h4 className="mt-5 font-semibold">Fee Settlement</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Enables low-cost fee payment for actions across the ecosystem.
              </p>
              <div className="bg-mint/60 mt-5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            </div>
          </div>
          <p className="token-disclaimer border-line/70 bg-ink/40 mx-auto mt-8 flex max-w-4xl items-start gap-3 rounded-xl border p-4 text-xs leading-5 text-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-shield-check text-mint mt-0.5 shrink-0"
            >
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span>
              Digital assets carry risk, including loss of value and loss of principal. Nothing on
              this page is investment advice, and token allocation details are provided for
              transparency about protocol mechanics, not as a projection of returns. Always review
              audited contract code and consult independent advice before participating.
            </span>
          </p>
          <div
            className="scroll-reveal is-visible token-stats border-line bg-line mt-10 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4"
            style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
          >
            <div className="token-stat bg-ink p-6 text-center sm:p-7">
              <span className="border-mint/20 bg-mint/10 text-mint mb-3 inline-flex size-7 items-center justify-center rounded-full border text-[10px] font-bold">
                01
              </span>
              <p className="text-mint text-3xl font-semibold tracking-tight">
                <span>$9.6T</span>
              </p>
              <p className="mt-3 text-sm font-medium">Daily forex market volume</p>
              <p className="mt-1 text-xs text-muted">Global market, 2025 est.</p>
            </div>
            <div className="token-stat bg-ink p-6 text-center sm:p-7">
              <span className="border-mint/20 bg-mint/10 text-mint mb-3 inline-flex size-7 items-center justify-center rounded-full border text-[10px] font-bold">
                02
              </span>
              <p className="text-mint text-3xl font-semibold tracking-tight">
                <span>24</span>
              </p>
              <p className="mt-3 text-sm font-medium">Hours of continuous access</p>
              <p className="mt-1 text-xs text-muted">Protocol design target</p>
            </div>
            <div className="token-stat bg-ink p-6 text-center sm:p-7">
              <span className="border-mint/20 bg-mint/10 text-mint mb-3 inline-flex size-7 items-center justify-center rounded-full border text-[10px] font-bold">
                03
              </span>
              <p className="text-mint text-3xl font-semibold tracking-tight">
                <span>10,000</span>
              </p>
              <p className="mt-3 text-sm font-medium">Virtual mining machines planned</p>
              <p className="mt-1 text-xs text-muted">Roadmap allocation</p>
            </div>
            <div className="token-stat bg-ink p-6 text-center sm:p-7">
              <span className="border-mint/20 bg-mint/10 text-mint mb-3 inline-flex size-7 items-center justify-center rounded-full border text-[10px] font-bold">
                04
              </span>
              <p className="text-mint text-3xl font-semibold tracking-tight">
                <span>5Y</span>
              </p>
              <p className="mt-3 text-sm font-medium">Progressive vesting period</p>
              <p className="mt-1 text-xs text-muted">Token emission schedule</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-mint text-xs font-bold uppercase tracking-[.22em]">FAQ</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Common questions
          </h2>
        </div>
        <div
          className="scroll-reveal is-visible mt-10 space-y-3"
          style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
        >
          <details className="border-line bg-panel/50 group rounded-xl border p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
              What makes FYNTIX different from a broker?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-down shrink-0 text-muted transition group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </summary>
            <p className="mt-4 text-sm leading-6 text-muted">
              Brokers hold client funds and execute trades on your behalf. FYNTIX is a protocol —
              your wallet holds your funds directly, and smart contracts execute trades without a
              custodian in between.
            </p>
          </details>
          <details className="border-line bg-panel/50 group rounded-xl border p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
              Does FYNTIX ever have access to my funds?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-down shrink-0 text-muted transition group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </summary>
            <p className="mt-4 text-sm leading-6 text-muted">
              No. Every action requires a cryptographic signature from your own wallet. FYNTIX
              cannot move, freeze, or access funds without that signature.
            </p>
          </details>
          <details className="border-line bg-panel/50 group rounded-xl border p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
              What network does the protocol run on?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-down shrink-0 text-muted transition group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </summary>
            <p className="mt-4 text-sm leading-6 text-muted">
              FYNTIX is designed for the Binance Smart Chain, with a multi-chain compatible
              architecture planned for future network support.
            </p>
          </details>
          <details className="border-line bg-panel/50 group rounded-xl border p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
              Are the smart contracts audited?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-down shrink-0 text-muted transition group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </summary>
            <p className="mt-4 text-sm leading-6 text-muted">
              An independent audit and public bug bounty are scheduled ahead of mainnet, per the
              roadmap above. Audit reports will be published once complete.
            </p>
          </details>
          <details className="border-line bg-panel/50 group rounded-xl border p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
              Is participation in FYNTIX risk-free?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-down shrink-0 text-muted transition group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </summary>
            <p className="mt-4 text-sm leading-6 text-muted">
              No. Forex trading and digital assets both carry real risk, including loss of
              principal. Nothing here should be read as a guarantee of returns.
            </p>
          </details>
        </div>
      </section>

      <section className="page-grid border-line relative border-t">
        <div className="bg-mint/[.07] pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full blur-[100px]"></div>
        <div
          className="scroll-reveal is-visible relative mx-auto max-w-3xl px-5 py-20 text-center lg:py-24"
          style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Want to look under the hood?
          </h2>
          <p className="mt-4 leading-7 text-muted">
            Read the litepaper, review the contract architecture, or get in touch with the protocol
            team directly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#">
              <button className="bg-mint text-ink hover:bg-mint/90 inline-flex items-center justify-center gap-2 rounded-xl px-4 px-5 py-2.5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50">
                Read the Litepaper
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-up-right"
                >
                  <path d="M7 7h10v10"></path>
                  <path d="M7 17 17 7"></path>
                </svg>
              </button>
            </a>
            <a href="#contact">
              <button className="border-line bg-panel hover:border-mint/50 inline-flex items-center justify-center gap-2 rounded-xl border px-4 px-5 py-2.5 py-3 text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-50">
                Contact the Team
              </button>
            </a>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-line bg-panel border-t">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(3,.7fr)_1.2fr]">
            <div>
              <ThemeLogo width={1193} height={366} className="h-9 w-auto" />
              <p className="mt-5 max-w-xs text-sm leading-6 text-muted">
                A decentralised forex liquidity protocol connecting traders and liquidity providers
                through transparent, non-custodial smart contracts.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href="#"
                  className="border-line hover:border-mint/50 hover:text-mint grid size-9 place-items-center rounded-lg border text-muted transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-twitter"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="border-line hover:border-mint/50 hover:text-mint grid size-9 place-items-center rounded-lg border text-muted transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-send"
                  >
                    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                    <path d="m21.854 2.147-10.94 10.939"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="border-line hover:border-mint/50 hover:text-mint grid size-9 place-items-center rounded-lg border text-muted transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-message-circle"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold">Protocol</h5>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li>
                  <a href="#protocol" className="transition hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="transition hover:text-foreground">
                    Architecture
                  </a>
                </li>
                <li>
                  <a href="#security" className="transition hover:text-foreground">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#token" className="transition hover:text-foreground">
                    Token
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold">Resources</h5>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li>
                  <a href="#" className="transition hover:text-foreground">
                    Litepaper
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-foreground">
                    Audit Reports
                  </a>
                </li>
                <li>
                  <a href="#faq" className="transition hover:text-foreground">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#roadmap" className="transition hover:text-foreground">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold">Company</h5>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li>
                  <a href="#" className="transition hover:text-foreground">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#contact" className="transition hover:text-foreground">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-foreground">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold">Stay updated</h5>
              <p className="mt-4 text-sm leading-6 text-muted">
                Protocol updates, audit results, and release notes — no noise.
              </p>
              <form className="mt-4 flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="border-line bg-panel focus:border-mint/60 min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none placeholder:text-muted"
                />
                <button
                  type="button"
                  className="bg-mint text-ink hover:bg-mint/90 rounded-xl px-4 text-sm font-semibold"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
          <div className="border-line mt-12 flex flex-col gap-4 border-t pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 FYNTIX Protocol. All rights reserved.</p>
            <div className="flex gap-5">
              <a className="hover:text-foreground" href="#">
                Privacy Policy
              </a>
              <a className="hover:text-foreground" href="#">
                Terms of Use
              </a>
              <a className="hover:text-foreground" href="#">
                Risk Disclosure
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
