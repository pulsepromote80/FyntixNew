import { StatCard } from "./StatCard";
import { Zap, TrendingUp } from "lucide-react";

const boosterData = [
  {
    title: "TOTAL ROI BOOSTER",
    value: "$9,700.00",
    variant: "blue" as const,
    icon: <TrendingUp size={18} />,
  },
  {
    title: "TOTAL WITHDRAWAL BOOSTER",
    value: "$47,253.00",
    variant: "purple" as const,
    icon: <Zap size={18} />,
  },
];

export function BoosterOverview() {
  return (
    <section className="mb-6">
      {/* Section Header */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-gray-400" /> Booster Overview
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {boosterData.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            variant={item.variant}
            icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
}