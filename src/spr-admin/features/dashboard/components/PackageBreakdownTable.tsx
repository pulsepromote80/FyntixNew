import { Package } from "lucide-react";


const packageData = [
  { name: "Package 1", color: "bg-emerald-500", fixed: "$300.00", invested: "$42,300.00", users: "141 users", percent: "1.2%", percentValue: 1.2 },
  { name: "Package 2", color: "bg-green-500", fixed: "$500.00", invested: "$2,588,000.00", users: "5,176 users", percent: "72.1%", percentValue: 72.1 },
  { name: "Package 3", color: "bg-yellow-500", fixed: "$1,000.00", invested: "$65,000.00", users: "65 users", percent: "1.8%", percentValue: 1.8 },
  { name: "Package 4", color: "bg-orange-500", fixed: "$500.00", invested: "$48,000.00", users: "96 users", percent: "1.3%", percentValue: 1.3 },
  { name: "Package 5", color: "bg-pink-500", fixed: "$1,000.00", invested: "$105,000.00", users: "105 users", percent: "2.9%", percentValue: 2.9 },
  { name: "Package 10", color: "bg-purple-500", fixed: "$500.00", invested: "$98,500.00", users: "197 users", percent: "2.7%", percentValue: 2.7 },
  { name: "Package 11", color: "bg-indigo-500", fixed: "$500.00", invested: "$191,000.00", users: "383 users", percent: "5.3%", percentValue: 5.3 },
  { name: "Package 12", color: "bg-blue-600", fixed: "$500.00", invested: "$452,000.00", users: "904 users", percent: "12.6%", percentValue: 12.6 },
];

export function PackageBreakdownTable() {
  return (
    <section className="mb-6">
      {/* Section Header */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Package className="w-4 h-4 text-gray-400" /> Package-wise Breakdown
      </h2>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Package</th>
                <th className="px-6 py-4 font-medium">Fixed Amount</th>
                <th className="px-6 py-4 font-medium">Total Invested</th>
                <th className="px-6 py-4 font-medium">Users Count</th>
                <th className="px-6 py-4 font-medium">% of Package Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packageData.map((pkg, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3 font-medium text-gray-800">
                    <span className={`w-2.5 h-2.5 rounded-full ${pkg.color}`} />
                    {pkg.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{pkg.fixed}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium">{pkg.invested}</td>
                  <td className="px-6 py-4 text-gray-600">{pkg.users}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full max-w-[120px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${pkg.color}`} 
                          style={{ width: `${pkg.percentValue}%` }} 
                        />
                      </div>
                      <span className="text-xs text-gray-500 min-w-[35px]">{pkg.percent}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}