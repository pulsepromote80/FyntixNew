const metrics = [
  { label: "NET BALANCE", value: "$17,860,053.99" },
  { label: "TOTAL USERS", value: "11,079" },
  { label: "AVAILABLE TO WITHDRAW", value: "$1,117,309.29" },
  { label: "APPROVAL RATE", value: "84.0%" },
  { label: "AVG. INVESTMENT / USER", value: "$1,948.62" },
  { label: "TOTAL INCOME PAID", value: "$5,047,811.29" },
];

export function BottomSummaryMetrics() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mt-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-bold text-gray-800">{metric.value}</p>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{metric.label}</p>
        </div>
      ))}
    </div>
  );
}