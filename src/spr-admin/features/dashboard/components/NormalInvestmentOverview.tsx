import { StatCard } from "./StatCard";
import { TrendingUp, User, UserCheck, Gift } from "lucide-react";

// Static data array matching the screenshot
const investmentData = [
  {
    title: "Total Investment",
    value: "$17,998,459.76",
    subtitle: "Approved only",
    variant: "orange" as const,
    icon: <TrendingUp size={18} />,
  },
  {
    title: "Admin Investment",
    value: "$5,653,587.41",
    subtitle: "31.4% of normal",
    variant: "red" as const,
    icon: <UserCheck size={18} />,
  },
  {
    title: "User Self Investment",
    value: "$381,135.00",
    subtitle: "2.1% of normal",
    variant: "blue" as const,
    icon: <User size={18} />,
  },
  {
    title: "Gift & Special Gift Investment",
    value: "$9,112,331.35",
    subtitle: "50.6% of normal",
    variant: "pink" as const,
    icon: <Gift size={18} />,
  },
];

export function NormalInvestmentOverview() {
  return (
    <section className="mb-6">
      {/* Section Header */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-400" /> Normal Investment Overview
      </h2>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {investmentData.map((item, index) => (
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