"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { IconType } from "react-icons";

import {
  RiLineChartLine,
  RiRocketLine,
  RiShareLine,
  RiAwardLine,
  RiGroupLine,
  RiBriefcaseLine,
  RiArrowUpLine,
  RiRefreshLine,
} from "react-icons/ri";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getText(value: unknown, fallback: string): string {
  return (typeof value === "string" || typeof value === "number") && String(value)
    ? String(value)
    : fallback;
}

// Simple UI Components
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease-out' }}>{children}</div>;
}

function CountUp({ value, prefix = "", dec = 2 }: { value: number; prefix?: string; dec?: number }) {
  const animatedValue = useCountUp(value, 1000);
  return <span>{prefix}{animatedValue.toFixed(dec)}</span>;
}

function Ring({ pct, size = 100, color = "#3b8bff", sub = "" }: { pct: number; size?: number; color?: string; sub?: string }) {
  const radius = (size - 16) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="ring-wrap" style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="ring-txt" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 'bold' }}>{pct.toFixed(0)}%</span>
        {sub && <span style={{ fontSize: 10 }}>{sub}</span>}
      </div>
    </div>
  );
}

function Donut({ size = 100, stroke = 12, parts = [], center }: { size?: number; stroke?: number; parts: Array<{ pct: number; color: string }>; center?: React.ReactNode }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {parts.map((part, i) => {
          const segmentLength = (part.pct / 100) * circumference;
          const segment = (
            <circle
              key={i}
              cx={size/2}
              cy={size/2}
              r={radius}
              stroke={part.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={segmentLength}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += segmentLength;
          return segment;
        })}
      </svg>
      {center && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white' }}>{center}</div>}
    </div>
  );
}

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const icons = {
    arrowUp: RiArrowUpLine,
    refresh: RiRefreshLine,
    share: RiShareLine,
    rocket: RiRocketLine,
    chart: RiLineChartLine,
    award: RiAwardLine,
    group: RiGroupLine,
    briefcase: RiBriefcaseLine,
  };
  const IconComponent: IconType = icons[name as keyof typeof icons] || RiArrowUpLine;
  return <IconComponent size={size} />;
}

function Spark({ data = [], color = "#3b8bff" }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${i * 10},${30 - (v / max) * 25}`).join(' ');
  return (
    <svg width={data.length * 10} height={30} viewBox={`0 0 ${data.length * 10} 30`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}

function money(value: number, dec = 2): string {
  return `$${value.toFixed(dec)}`;
}

// ---------- Count-up hook ----------
function useCountUp(endValue: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    const target = Number(endValue) || 0;
    const startValue = startValueRef.current;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = startValue + (target - startValue) * progress;
      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setValue(target);
        startValueRef.current = target;
      }
    };

    

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [endValue, duration]);

  return value;
}

export default function AIBUSINESSHUB() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [affiliate, setAffiliate] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const boosterRemDateTime = "";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/Authentication/affiliate-network');
        const data: unknown = await response.json();
        if (
          isRecord(data) &&
          data.statusCode === 200 &&
          Array.isArray(data.data) &&
          isRecord(data.data[0])
        ) {
          setAffiliate(data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!boosterRemDateTime) return;
    const target = new Date(boosterRemDateTime);
    const updateTimer = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setHours(h);
        setMinutes(m);
        setSeconds(s);
      } else {
        setHours(0);
        setMinutes(0);
        setSeconds(0);
      }
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [boosterRemDateTime]);

  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  // Data from affiliate
  const activeDirectMembers = getText(affiliate?.ActiveDirectMembers, "0");
  const directBusiness = getNumber(affiliate?.DirectBusiness);
  const subscription = getNumber(affiliate?.EarningLimit);
  const teamBusiness = getNumber(affiliate?.TeamBusiness);
  const directBonus = getNumber(affiliate?.DynamicReferralYield);
  const matchingIncome = getNumber(affiliate?.DailyRevenueSharing);
  const rewardBonus = getNumber(affiliate?.BoosterProfit);
  const yieldIncome = getNumber(affiliate?.UnityRevenueYield);
  const levelIncome = getNumber(affiliate?.PerformanceRevenue);
  const performanceWithdrawal = getNumber(affiliate?.IncomeWithdrawal);
  const yieldWithdrawal = getNumber(affiliate?.MentorWithdrawal);
  const tradingPackage = getNumber(affiliate?.BoosterPackage);
  const smartBonds = getNumber(affiliate?.SmartBonds);
  const smartGrowth = getNumber(affiliate?.SmartGrowth);
  const secureBonds = getNumber(affiliate?.SecureBonds);
  const leftBusvolume = getNumber(affiliate?.PowerTeamBusines);
  const rightBusvolume = getNumber(affiliate?.WeakerTeamBusines);
  const strongLegID = getText(affiliate?.PowerTeamID, "N/A");
  const leadershipRank = getText(affiliate?.UserRank, "N/A");
  const rankPercentage = getNumber(affiliate?.YieldPer);
  const totalEarning = getNumber(affiliate?.TotalEarning);
  const remainingLimit = getNumber(affiliate?.RemainingLimit);
  const totalTeam = getText(affiliate?.TotalTeam, "0");
  const activeTeam = getText(affiliate?.ActiveTeam, "0");

  // Calculated values
  const teamTotal = Number(leftBusvolume) + Number(rightBusvolume);
  const powerLeg = Math.max(Number(leftBusvolume), Number(rightBusvolume));
  const weakLeg = Math.min(Number(leftBusvolume), Number(rightBusvolume));

  const kpis = [
    { label: "Dynamic Referral Yield", value: directBonus, prefix: "$", dec: 2, tone: "green", icon: "arrowUp", trend: "+12%", series: [12, 15, 18, 22, 25, 28, 30] },
    { label: "Daily Revenue Sharing", value: matchingIncome, prefix: "$", dec: 2, tone: "blue", icon: "chart", trend: "+8%", series: [10, 12, 14, 16, 18, 20, 22] },
    { label: "Booster Profit", value: rewardBonus, prefix: "$", dec: 2, tone: "violet", icon: "award", trend: "+15%", series: [8, 10, 12, 15, 18, 20, 25] },
    { label: "Unity Revenue Yield", value: yieldIncome, prefix: "$", dec: 2, tone: "amber", icon: "rocket", trend: "+20%", series: [15, 18, 22, 25, 28, 32, 35] },
    { label: "Performance Revenue", value: levelIncome, prefix: "$", dec: 2, tone: "violet", icon: "group", trend: "+10%", series: [10, 12, 14, 16, 18, 20, 22] },
    { label: "Smart Bonds", value: smartBonds, prefix: "$", dec: 2, tone: "blue", icon: "briefcase", trend: "+18%", series: [12, 14, 16, 18, 20, 22, 24] },
    { label: "Smart Growth", value: smartGrowth, prefix: "$", dec: 2, tone: "green", icon: "share", trend: "+25%", series: [15, 18, 21, 24, 27, 30, 33] },
    { label: "Secure Bonds", value: secureBonds, prefix: "$", dec: 2, tone: "amber", icon: "refresh", trend: "+22%", series: [10, 13, 16, 19, 22, 25, 28] },
  ];

  const wallets = [
    { label: "Total Earning", value: totalEarning },
    { label: "Earning Limit", value: subscription },
    { label: "Remaining Limit", value: remainingLimit },
    { label: "Team Business", value: teamBusiness },
  ];

  const packages = [
    { key: "lp", name: "Liquidity Provider", desc: "LP Trade", active: 0, total: 0, limit: 10000, pending: 5000, tone: "blue" },
    { key: "sb", name: "Smart Bonds", desc: "Fixed returns", active: smartBonds, total: smartBonds, limit: 15000, pending: 7000, tone: "violet" },
    { key: "sec", name: "Secure Bonds", desc: "Secure growth", active: secureBonds, total: secureBonds, limit: 20000, pending: 8000, tone: "amber" },
  ];

  const boosters = [
    { key: "r", name: "Runner", icon: "🏃", reward: 20, req: "Sponsor 3 direct participants within 7 days", window: "", target: 3, progress: 2, state: "IN PROGRESS" },
    { key: "b", name: "Biker", icon: "🚴", reward: 30, req: "Achieve 3 Runners within 15 days", window: "", target: 3, progress: 0, state: "LOCKED" },
    { key: "f", name: "Fighter", icon: "🥊", reward: 50, req: "Achieve 3 Bikers within 30 days", window: "", target: 3, progress: 0, state: "LOCKED" },
  ];

  const dryTiers = [
    { dir: 1, pct: 10 },
    { dir: 3, pct: 15 },
    { dir: 5, pct: 20 },
    { dir: 10, pct: 30 },
    { dir: 20, pct: 50 },
    { dir: 50, pct: 100 },
  ];

  const unityTiers = [
    { vol: "$10K", pct: 15 },
    { vol: "$50K", pct: 25 },
    { vol: "$100K", pct: 40 },
    { vol: "$500K", pct: 60 },
    { vol: "$1M", pct: 80 },
    { vol: "$5M", pct: 100 },
  ];

  const incomeHistory = [
    { name: "Direct Income", amount: directBonus, icon: "arrowUp" },
    { name: "Binary Income", amount: matchingIncome, icon: "chart" },
    { name: "Rank & Reward", amount: rewardBonus, icon: "award" },
    { name: "ROI Income", amount: yieldIncome, icon: "rocket" },
    { name: "Level Income", amount: levelIncome, icon: "group" },
  ];

  const incomeTotal = incomeHistory.reduce((a, i) => a + i.amount, 0);
  const topStream = incomeHistory.length > 0
    ? incomeHistory.reduce((m, i) => (i.amount > m.amount ? i : m), incomeHistory[0]!)
    : null;

  const palette = ["#1f6fe5", "#0a9b62", "#8a5cf0", "#e8920a", "#e0334f", "#14a8c9"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <>
      <div className="hub-bg p-4 sm:p-6 lg:p-8">

      


        {/* Business Overview */}
        <section className="mb-8">
          <Reveal>
            <div className="hub-card hub-biz">
              <div>
                <small className="mono">Team Business</small>
                <div className="num mono"><CountUp value={teamTotal} prefix="$" dec={2} /></div>
                <span className="hub-badge"><span className="hub-pulse" /> Network volume growing</span>
              </div>
              <div>
                <div className="hub-legkey">
                  <div><small><i className="hub-dot" style={{ background: 'var(--hub-green)' }} />Strong team</small><b className="mono">{money(powerLeg, 0)}</b></div>
                  <div style={{ textAlign: 'right' }}><small><i className="hub-dot" style={{ background: 'var(--hub-amber)' }} />Other team</small><b className="mono">{money(weakLeg, 0)}</b></div>
                </div>
                <div className="hub-legbar">
                  <div style={{ width: `${(powerLeg / teamTotal) * 100}%` }} />
                  <div style={{ width: `${(weakLeg / teamTotal) * 100}%`, minWidth: 6 }} />
                </div>
                <div className="sub">Power leg carries {((powerLeg / teamTotal) * 100).toFixed(2)}% of total volume</div>
              </div>
              <div className="hub-idcard"><small className="mono">Strong Team ID</small><b className="mono">{strongLegID}</b></div>
            </div>
          </Reveal>
        </section>

        {/* KPI Tiles */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k, i) => (
              <Reveal key={k.label} delay={i * 90}>
                <div className={`hub-card hub-k2 hub-tone-${k.tone}`}>
                  <div className="hub-k2-top">
                    <div className="ico"><Icon name={k.icon} size={20} /></div>
                    <span className="trend">{k.trend}</span>
                  </div>
                  <small className="mono">{k.label}</small>
                  <b className="mono"><CountUp value={k.value} prefix={k.prefix} dec={k.dec} /></b>
                  <div className="spark">
                    <Spark data={k.series} color={k.tone === "green" ? "var(--hub-green)" : k.tone === "blue" ? "var(--hub-blue)" : k.tone === "violet" ? "var(--hub-violet)" : "var(--hub-amber)"} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>


        {/* Trading Packages */}
        <section className="mb-8">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.2px' }}>Trading Packages</h2>
            <span style={{ color: 'var(--hub-muted)', fontSize: 13 }}>Fund from $10 — choose how your capital works</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {packages.map((p, i) => {
              const pct = ((p.limit - p.pending) / p.limit) * 100;
              return (
                <Reveal key={p.key} delay={i * 100}>
                  <div className="hub-card pkg">
                    <div className="hub-card-head">
                      <div><h3>{p.name}</h3><div className="sub">{p.desc}</div></div>
                      <span className="hub-chip green">Running</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Ring pct={pct} size={116} color={p.tone === "blue" ? "var(--hub-blue)" : p.tone === "violet" ? "var(--hub-violet)" : "var(--hub-amber)"} sub="of limit used" />
                    </div>
                    <div className="hub-pkg-grid">
                      <div className="hub-pkg-cell"><small className="mono">Active Investment</small><b className="mono">{money(p.active)}</b></div>
                      <div className="hub-pkg-cell"><small className="mono">Total Investment</small><b className="mono">{money(p.total)}</b></div>
                      <div className="hub-pkg-cell"><small className="mono">Earning Limit</small><b className="mono">{money(p.limit)}</b></div>
                      <div className="hub-pkg-cell"><small className="mono">Pending Limit</small><b className="mono">{money(p.pending)}</b></div>
                    </div>
                    <div className="hub-bar"><div style={{ width: `${pct}%` }} /></div>
                    <div className="sub" style={{ marginTop: 6 }}>{pct.toFixed(0)}% of limit used</div>
                    <div className="flex gap-3" style={{ marginTop: 16 }}>
                      <button className="hub-btn blue" style={{ flex: 1 }} onClick={() => router.push('/investment-amount')}>Invest</button>
                      <button className="hub-btn" style={{ flex: 1 }} onClick={() => router.push('/investment-amount')}>Reinvest</button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Boosters */}
        <section className="mb-8">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.2px' }}>Booster Profit Protocol</h2>
            <span style={{ color: 'var(--hub-muted)', fontSize: 13 }}>Hit direct targets in sequence for 20% &rarr; 30% &rarr; 50% monthly profit</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {boosters.map((b, i) => (
              <Reveal key={b.key} delay={i * 100}>
                <div className={`hub-card boost ${b.state === "LOCKED" ? "locked" : ""}`}>
                  <span className={`hub-chip ${b.state === "LOCKED" ? "muted" : b.state === "IN PROGRESS" ? "amber" : "green"}`} style={{ position: 'absolute', top: 14, right: 14 }}>{b.state}</span>
                  <div className="emoji">{b.icon}</div>
                  <h4>{b.name}</h4>
                  <div className="rw"><CountUp value={b.reward} dec={0} />%</div>
                  <div className="sub">Monthly Profit</div>
                  <div className="rq">{b.req}</div>
                  <div className="hub-bar"><div style={{ width: `${(b.progress / b.target) * 100}%` }} /></div>
                  <div className="hub-steps">{Array.from({ length: b.target }).map((_, s) => <i key={s} className={s < b.progress ? "on" : ""} />)}</div>
                  <div className="sub" style={{ marginTop: 8 }}>{b.progress}/{b.target} complete</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* DRY + Unity */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Reveal>
              <div className="hub-card">
                <div className="hub-card-head">
                  <div><h3>Dynamic Referral Yield</h3><div className="sub">Leader opportunity · 10% to 100%</div></div><span className="hub-chip blue">Leader</span>
                </div>
                <div className="hub-tiers">
                  {dryTiers.map((t) => (
                    <div className={`hub-tier ${t.dir === Number(activeDirectMembers) ? "current" : ""}`} key={t.dir}>
                      <span className="mono">{t.dir} direct{t.dir > 1 ? "s" : ""}</span><div className="hub-bar"><div style={{ width: `${t.pct}%` }} /></div><b className="mono">{t.pct}%</b>
                    </div>
                  ))}
                </div>
                <div className="sub" style={{ marginTop: 12 }}>You have {activeDirectMembers} active directs → <b style={{ color: 'var(--hub-amber)' }}>{dryTiers[Number(activeDirectMembers || 0) - 1]?.pct || 0}% yield</b></div>
              </div>
            </Reveal>
            <Reveal delay={100}> 
              <div className="hub-card">
                <div className="hub-card-head">
                  <div><h3>Unity Revenue Yield</h3><div className="sub">Differential on total volume · 15% to 100%</div></div><span className="hub-chip green">Volume scaling</span>
                </div>
                <div className="hub-tiers">
                  {unityTiers.map((t) => (
                    <div className="hub-tier" key={t.vol}><span>{t.vol}</span><div className="hub-bar"><div style={{ width: `${t.pct}%` }} /></div><b className="mono">{t.pct}%</b></div>
                  ))}
                </div>
                <div className="sub" style={{ marginTop: 12 }}>Higher volume → higher percentage. You earn the difference between your rate and your team&apos;s rate.</div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Performance Revenue Yield */}
        <section className="mb-8">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.2px' }}>Performance Revenue Yield</h2>
            <span style={{ color: 'var(--hub-muted)', fontSize: 13 }}>Weekly rank income on matching volume · 50% power leg + 50% weaker leg</span>
          </div>
          <Reveal>
            <div className="hub-card">
              <div className="flex items-center gap-6 mb-6">
                <Ring pct={rankPercentage} size={104} color="var(--hub-amber)" sub={`to next rank`} />
                <div style={{ flex: 1 }}>
                  <h3>Current rank: {leadershipRank}</h3>
                  <div className="sub">Next target needs matching volume</div>
                  <div className="flex gap-4" style={{ marginTop: 14 }}>
                    <div className="leg"><small>Power leg (50%)</small><b className="mono" style={{ color: 'var(--hub-green)' }}>{money(powerLeg, 0)}</b></div>
                    <div className="leg"><small>Weaker leg (50%)</small><b className="mono" style={{ color: 'var(--hub-amber)' }}>{money(weakLeg, 0)}</b></div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto" style={{ marginTop: 18 }}>
                <table className="hub-tbl">
                  <thead><tr><th>Rank</th><th>Matching Business</th><th>Weekly Reward</th><th>Duration</th><th>Progress</th></tr></thead>
                  <tbody>
                    <tr><td><b>Bronze</b></td><td className="mono">{money(1000, 0)}</td><td className="reward mono">{money(50, 0)}</td><td>4 Weeks</td><td style={{ minWidth: 120 }}><div className="hub-bar"><div style={{ width: '100%' }} /></div></td></tr>
                    <tr><td><b>Silver</b></td><td className="mono">{money(5000, 0)}</td><td className="reward mono">{money(100, 0)}</td><td>6 Weeks</td><td style={{ minWidth: 120 }}><div className="hub-bar"><div style={{ width: '75%' }} /></div></td></tr>
                    <tr><td><b>Gold</b></td><td className="mono">{money(10000, 0)}</td><td className="reward mono">{money(200, 0)}</td><td>8 Weeks</td><td style={{ minWidth: 120 }}><div className="hub-bar"><div style={{ width: '50%' }} /></div></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Team + Personal */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Reveal>
              <div className="hub-card">
                <div className="hub-card-head">
                  <h3>Team Network</h3>
                  <span className="hub-chip blue">Direct line</span>
                </div>
                <div className="grid grid-cols-3 gap-3" style={{ gap: 10, gridTemplateColumns: 'repeat(3,1fr)' }}>
                  <div className="hub-wallet" style={{ textAlign: 'center' }}><small>Direct ID</small><b className="mono" style={{ color: 'var(--hub-text)' }}>{getText(affiliate?.AuthloginId, "N/A")}</b></div>
                  <div className="hub-wallet" style={{ textAlign: 'center' }}><small>Active Direct</small><b className="mono">{activeDirectMembers}</b></div>
                  <div className="hub-wallet" style={{ textAlign: 'center' }}><small>Direct Business</small><b className="mono"><CountUp value={directBusiness} prefix="$" dec={0} /></b></div>
                  <div className="hub-wallet" style={{ textAlign: 'center' }}><small>Total Team</small><b className="mono">{totalTeam}</b></div>
                  <div className="hub-wallet" style={{ textAlign: 'center' }}><small>Active Team</small><b className="mono">{activeTeam}</b></div>
                  <div className="hub-wallet" style={{ textAlign: 'center' }}><small>Team Business</small><b className="mono"><CountUp value={teamBusiness} prefix="$" dec={0} /></b></div>
                </div>
                <div className="hub-kv" style={{ marginTop: 14 }}><span>Current Booster Rank</span><span>{leadershipRank}</span></div>
                <div className="hub-kv"><span>Booster Status</span><span>Active</span></div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="hub-card">
                <div className="hub-card-head">
                  <h3>Personal Info</h3>
                  <span className="hub-chip muted">Active</span>
                </div>
                <div className="hub-kv"><span>User ID</span><span className="mono">{getText(affiliate?.AuthloginId, "N/A")}</span></div>
                <div className="hub-kv"><span>Email</span><span className="mono">{getText(affiliate?.EmailId, "N/A")}</span></div>
                <div className="hub-kv"><span>Mobile</span><span className="mono">{getText(affiliate?.Mobile, "N/A")}</span></div>
                <div className="hub-kv"><span>Sponsor</span><span className="mono">{getText(affiliate?.SponsorId, "N/A")}</span></div>
                <div className="hub-kv"><span>Current Rank</span><span>{leadershipRank}</span></div>
                <div className="hub-kv"><span>Rank Progress</span><span>{rankPercentage}%</span></div>
                <div className="hub-kv"><span>Strong Team ID</span><span className="mono">{strongLegID}</span></div>
              </div>
            </Reveal>
          </div>
        </section>

        <p className="foot">Risk notice — investing involves market risk. Past performance does not guarantee future results.</p>
      </div>
      <div className={`hub-toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
