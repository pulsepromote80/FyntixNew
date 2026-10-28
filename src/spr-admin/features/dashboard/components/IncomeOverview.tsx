import { StatCard } from "./StatCard";
import { 
  Wallet, Calendar, TrendingUp, ShieldCheck, Network, Users, 
  Award, Gift, Star, Sparkles, RefreshCw, DollarSign, MoreHorizontal 
} from "lucide-react";

// Top 3 summary cards
const topSummaryData = [
  {
    title: "TOTAL INCOME DISTRIBUTED",
    value: "$5,047,811.29",
    subtitle: "All types combined",
    variant: "yellow" as const,
    icon: <Wallet size={18} />,
  },
  {
    title: "TODAY'S INCOME",
    value: "$0.00",
    subtitle: "25 Sep 2026",
    variant: "green" as const,
    icon: <Calendar size={18} />,
  },
  {
    title: "THIS WEEK'S INCOME",
    value: "$0.00",
    subtitle: "21 Sep - 27 Sep",
    variant: "blue" as const,
    icon: <Calendar size={18} />,
  },
];

// The 12 colorful grid cards
const incomeGridData = [
  { title: "DIRECT INCOME", value: "$58,488.09", subtitle: "1.2% of total", variant: "blue" as const, icon: <TrendingUp size={18} /> },
  { title: "ROI INCOME", value: "$1,062,806.20", subtitle: "21.1% of total", variant: "green" as const, icon: <ShieldCheck size={18} /> },
  { title: "BINARY INCOME", value: "$260,648.22", subtitle: "5.2% of total", variant: "blue" as const, icon: <Network size={18} /> },
  { title: "LEVEL INCOME", value: "$82,134.54", subtitle: "1.6% of total", variant: "yellow" as const, icon: <Users size={18} /> },
  
  { title: "RANK INCOME", value: "$155,764.19", subtitle: "3.1% of total", variant: "red" as const, icon: <Award size={18} /> },
  { title: "BONUS DIRECT", value: "$466,494.68", subtitle: "9.2% of total", variant: "orange" as const, icon: <Gift size={18} /> },
  { title: "BONUS ROI", value: "$1,875,789.00", subtitle: "37.2% of total", variant: "purple" as const, icon: <Star size={18} /> },
  
  { title: "SPECIAL ROI", value: "$772,703.73", subtitle: "15.3% of total", variant: "green" as const, icon: <Sparkles size={18} /> },
  { title: "STANDARD ROI", value: "$0.00", subtitle: "0.0% of total", variant: "yellow" as const, icon: <RefreshCw size={18} /> },
  { title: "REGULAR ROI", value: "$0.00", subtitle: "0.0% of total", variant: "blue" as const, icon: <RefreshCw size={18} /> },
  { title: "COMPOUND ROI", value: "$0.00", subtitle: "0.0% of total", variant: "purple" as const, icon: <DollarSign size={18} /> },
  
  { title: "OTHER ROI (MIP / GIFT / NORMAL 12)", value: "$312,982.62", subtitle: "6.2% of total", variant: "default" as const, icon: <MoreHorizontal size={18} /> },
];

export function IncomeOverview() {
  return (
    <section className="mb-6">
      {/* Section Header */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-400" /> Income Overview
      </h2>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
        {topSummaryData.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            variant={item.variant}
            icon={item.icon}
          />
        ))}
      </div>

      {/* 12 Grid Income Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {incomeGridData.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            variant={item.variant}
            icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
}