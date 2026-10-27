"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  RiTimerLine,
  RiLineChartLine,
  RiFlowChart,
  RiRocketLine,
  RiShareLine,
  RiAwardLine,
  RiGroupLine,
  RiBankCardLine,
  RiMoneyDollarCircleLine,
  RiTeamLine,
  RiKeyLine,
  RiBarChartLine,
  RiBriefcaseLine,
  RiArrowUpLine,
  RiRefreshLine,
} from "react-icons/ri";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
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

function Bar({ pct = 0 }: { pct: number }) {
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: 'linear-gradient(90deg, #3b8bff, #8a5cf0)', borderRadius: 3, transition: 'width 0.5s ease' }} />
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
  const icons: Record<string, any> = {
    arrowUp: RiArrowUpLine,
    refresh: RiRefreshLine,
    share: RiShareLine,
    rocket: RiRocketLine,
    chart: RiLineChartLine,
    award: RiAwardLine,
    group: RiGroupLine,
    briefcase: RiBriefcaseLine,
  };
  const IconComponent = icons[name] || RiArrowUpLine;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endValue, duration]);

  return value;
}

export default function AIBUSINESSHUB() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/Authentication/affiliate-network');
        const data = await response.json();
        if (data.statusCode === 200 && data.data && data.data.length > 0) {
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
    if (!affiliate?.BoosterRemDateTime) return;
    const target = new Date(affiliate.BoosterRemDateTime);
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
  }, [affiliate?.BoosterRemDateTime]);

  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  // Data from affiliate
  const totalInvestment = affiliate?.TotalInvestment || 0;
  const totalEarning = affiliate?.TotalEarning || 0;
  const earningLimit = affiliate?.EarningLimit || 0;
  const remainingLimit = affiliate?.RemainingLimit || 0;
  const activeDirectMembers = affiliate?.ActiveDirectMembers || 0;
  const directBusiness = affiliate?.DirectBusiness || 0;
  const subscription = affiliate?.Subscription || 0;
  const teamBusiness = affiliate?.ROIAmt || 0;
  const directBonus = affiliate?.DirectBonus || 0;
  const matchingIncome = affiliate?.MatchingIncome || 0;
  const rewardBonus = affiliate?.RewardBonus || 0;
  const yieldIncome = affiliate?.YieldIncome || 0;
  const levelIncome = affiliate?.LevelIncome || 0;
  const performanceWithdrawal = affiliate?.PerformanceWithdrawal || 0;
  const yieldWithdrawal = affiliate?.YieldWithdrawal || 0;
  const tradingPackage = affiliate?.TradingPackage || 0;
  const smartBonds = affiliate?.RebornPacakge || 0;
  const leftBusvolume = affiliate?.LeftBusvolume || 0;
  const rightBusvolume = affiliate?.RightBusvolume || 0;
  const strongLegID = affiliate?.Reborn2Pacakge || "N/A";
  const leadershipRank = affiliate?.LeadershipRank || "N/A";
  const rankPercentage = affiliate?.Levelopen || 0;

  // Calculated values
  const teamTotal = leftBusvolume + rightBusvolume;
  const powerLeg = Math.max(leftBusvolume, rightBusvolume);
  const weakLeg = Math.min(leftBusvolume, rightBusvolume);

  const kpis = [
    { label: "Direct Income", value: directBonus, prefix: "$", dec: 2, tone: "green", icon: "arrowUp", trend: "+12%", series: [12, 15, 18, 22, 25, 28, 30] },
    { label: "Binary Income", value: matchingIncome, prefix: "$", dec: 2, tone: "blue", icon: "chart", trend: "+8%", series: [10, 12, 14, 16, 18, 20, 22] },
    { label: "Rank & Reward", value: rewardBonus, prefix: "$", dec: 2, tone: "violet", icon: "award", trend: "+15%", series: [8, 10, 12, 15, 18, 20, 25] },
    { label: "ROI Income", value: yieldIncome, prefix: "$", dec: 2, tone: "amber", icon: "rocket", trend: "+20%", series: [15, 18, 22, 25, 28, 32, 35] },
    { label: "Level Income", value: levelIncome, prefix: "$", dec: 2, tone: "violet", icon: "group", trend: "+10%", series: [10, 12, 14, 16, 18, 20, 22] },
  ];

  const wallets = [
    { label: "Subscription", value: subscription },
    { label: "Trade Fund", value: teamBusiness },
    { label: "Working Wallet", value: performanceWithdrawal },
    { label: "ROI Wallet", value: yieldWithdrawal },
  ];

  const packages = [
    { key: "lp", name: "Liquidity Provider", desc: "LP Trade", active: tradingPackage, total: tradingPackage, limit: 10000, pending: 5000, tone: "blue" },
    { key: "sb", name: "Smart Bonds", desc: "Fixed returns", active: smartBonds, total: smartBonds, limit: 15000, pending: 7000, tone: "violet" },
    { key: "sec", name: "Secure Bonds", desc: "Secure growth", active: smartBonds, total: smartBonds, limit: 20000, pending: 8000, tone: "amber" },
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
  const topStream = incomeHistory.reduce((m, i) => (i.amount > m.amount ? i : m), incomeHistory[0]);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

        {/* Wallets + Income History */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Reveal>
              <div className="hub-card">
                <div className="hub-card-head">
                  <h3>Wallet Overview</h3>
                  <span className="hub-chip green">Live</span>
                </div>
                <div className="hub-total-bal">
                  <div><small className="hub-lbl">Total balance</small><b className="mono" style={{ display: 'block' }}><CountUp value={wallets.reduce((a, w) => a + w.value, 0)} prefix="$" dec={2} /></b></div>
                  <span className="hub-badge" style={{ marginTop: 0 }}>4 wallets</span>
                </div>
                <div className="grid grid-cols-2 gap-3" style={{ gap: 12 }}>
                  {wallets.map((w, i) => (
                    <div className={`hub-wc w${i + 1}`} key={w.label}>
                      <div className="row"><small>{w.label}</small><span className="chipmark" /></div>
                      <b className="mono"><CountUp value={w.value} prefix="$" dec={2} /></b>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3" style={{ marginTop: 16 }}>
                  <button className="hub-btn blue" style={{ flex: 1 }} onClick={() => say("Withdraw request started")}><Icon name="arrowUp" size={14} /> Withdraw</button>
                  <button className="hub-btn" style={{ flex: 1 }} onClick={() => say("Reinvest request started")}><Icon name="refresh" size={14} /> Reinvest</button>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="hub-card">
                <div className="hub-card-head">
                  <h3>Income History</h3>
                </div>
                <div className="hub-inc-top">
                  <Donut
                    size={120}
                    stroke={16}
                    parts={incomeHistory.filter((i) => i.amount > 0).map((i, n) => ({ pct: (i.amount / incomeTotal) * 100, color: palette[n % palette.length] }))}
                    center={<><b style={{ fontSize: 16 }}>{money(incomeTotal)}</b><small>EARNED</small></>}
                  />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <small className="hub-lbl">Top stream</small>
                    <div style={{ fontWeight: 800, fontSize: 17, margin: '4px 0' }}>{topStream.name}</div>
                    <div className="sub">{((topStream.amount / incomeTotal) * 100).toFixed(0)}% of total income</div>
                  </div>
                </div>
                {incomeHistory.map((i) => {
                  const n = incomeHistory.filter((x) => x.amount > 0).findIndex((x) => x.name === i.name);
                  const col = n >= 0 ? palette[n % palette.length] : "var(--hub-muted)";
                  return (
                    <div className="hub-inc2" key={i.name}>
                      <div className="ic" style={{ background: col }}><Icon name={i.icon} size={16} /></div>
                      <div>
                        <div className="nm">{i.name}<span>{((i.amount / incomeTotal) * 100).toFixed(1)}%</span></div>
                        <div className="hub-bar"><div style={{ width: `${(i.amount / incomeTotal) * 100}%` }} /></div>
                      </div>
                      <div className={`am mono ${i.amount ? "" : "zero"}`}>+{money(i.amount)}</div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
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
                  {dryTiers.map((t, i) => (
                    <div className={`hub-tier ${t.dir === activeDirectMembers ? "current" : ""}`} key={t.dir}>
                      <span className="mono">{t.dir} direct{t.dir > 1 ? "s" : ""}</span><div className="hub-bar"><div style={{ width: `${t.pct}%` }} /></div><b className="mono">{t.pct}%</b>
                    </div>
                  ))}
                </div>
                <div className="sub" style={{ marginTop: 12 }}>You have {activeDirectMembers} active directs → <b style={{ color: 'var(--hub-amber)' }}>{dryTiers[activeDirectMembers - 1]?.pct || 0}% yield</b></div>
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
                <div className="sub" style={{ marginTop: 12 }}>Higher volume → higher percentage. You earn the difference between your rate and your team's rate.</div>
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
                  <div className="hub-wallet" style={{ textAlign: 'center' }}><small>Direct ID</small><b className="mono" style={{ color: 'var(--hub-text)' }}><CountUp value={affiliate?.UserId || 0} /></b></div>
                  <div className="hub-wallet" style={{ textAlign: 'center' }}><small>Active Direct</small><b className="mono"><CountUp value={activeDirectMembers} /></b></div>
                  <div className="hub-wallet" style={{ textAlign: 'center' }}><small>Direct Business</small><b className="mono"><CountUp value={directBusiness} prefix="$" dec={0} /></b></div>
                </div>
                <div className="hub-kv" style={{ marginTop: 14 }}><span>Current Booster Rank</span><span>{leadershipRank}</span></div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--hub-muted)' }}>Booster Time</div>
                <div className="hub-timer">
                  <div><b className="mono">{String(hours).padStart(2, '0')}</b><small>hours</small></div>
                  <div><b className="mono">{String(minutes).padStart(2, '0')}</b><small>minutes</small></div>
                  <div><b className="mono">{String(seconds).padStart(2, '0')}</b><small>seconds</small></div>
                </div>
                <div className="hub-kv"><span>Booster Status</span><span>Active</span></div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="hub-card">
                <div className="hub-card-head">
                  <h3>Personal Info</h3>
                  <span className="hub-chip muted">Active</span>
                </div>
                <div className="hub-kv"><span>User ID</span><span className="mono">{affiliate?.UserId || "N/A"}</span></div>
                <div className="hub-kv"><span>Sponsor</span><span className="mono">{affiliate?.SponsorId || "N/A"}</span></div>
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
