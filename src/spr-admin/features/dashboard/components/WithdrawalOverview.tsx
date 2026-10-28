import { StatCard } from "./StatCard";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";

const withdrawalData = [
  {
    title: "AVAILABLE TO WITHDRAW",
    value: "$1,117,309.29",
    variant: "green" as const,
    icon: <CreditCard size={18} />,
  },
  {
    title: "APPROVED",
    value: "$3,132,702.46",
    variant: "green" as const,
    icon: <CheckCircle size={18} />,
  },
  {
    title: "PENDING",
    value: "$594,031.12",
    variant: "yellow" as const,
    icon: <Clock size={18} />,
  },
  {
    title: "REJECTED",
    value: "$1,972.19",
    variant: "red" as const,
    icon: <XCircle size={18} />,
  },
];

export function WithdrawalOverview() {
  return (
    <section className="mb-6">
      {/* Section Header */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-gray-400" /> Withdrawal Overview
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {withdrawalData.map((item, index) => (
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