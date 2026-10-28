import { StatCard } from "./StatCard";
import { Package, UserCheck, User, Lock } from "lucide-react";

const packageData = [
  {
    title: "TOTAL PACKAGE INVESTMENT",
    value: "$3,590,300.00",
    subtitle: "All packages combined",
    variant: "blue" as const,
    icon: <Package size={18} />,
  },
  {
    title: "ADMIN PACKAGE",
    value: "$3,302,900.00",
    subtitle: "92.0% of package",
    variant: "orange" as const,
    icon: <UserCheck size={18} />,
  },
  {
    title: "USER PACKAGE",
    value: "$287,400.00",
    subtitle: "8.0% of package",
    variant: "blue" as const,
    icon: <User size={18} />,
  },
  {
    title: "GRAND TOTAL INVESTMENT",
    value: "$21,588,759.76",
    subtitle: "Normal + Package",
    variant: "yellow" as const,
    icon: <Lock size={18} />,
  },
];

export function PackageInvestmentOverview() {
  return (
    <section className="mb-6">
      {/* Section Header */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Package className="w-4 h-4 text-gray-400" /> Package Investment Overview
      </h2>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packageData.map((item, index) => (
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