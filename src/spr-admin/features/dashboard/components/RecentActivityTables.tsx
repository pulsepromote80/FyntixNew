import { Users, CreditCard } from "lucide-react";

// Static data for Recent Users
const recentUsers = [
  { name: "NR 13", email: "narinardas55@gmail.com", investment: "$0.00", placedBy: "Self", joined: "Sep 17, 2026" },
  { name: "NR 12", email: "narinardas55@gmail.com", investment: "$0.00", placedBy: "Self", joined: "Sep 17, 2026" },
  { name: "NR 11", email: "narinardas55@gmail.com", investment: "$0.00", placedBy: "Self", joined: "Sep 17, 2026" },
  { name: "NR 10", email: "narinardas55@gmail.com", investment: "$0.00", placedBy: "Self", joined: "Sep 17, 2026" },
  { name: "NR 9", email: "narinardas55@gmail.com", investment: "$0.00", placedBy: "Self", joined: "Sep 17, 2026" },
];

// Static data for Recent Withdrawals
const recentWithdrawals = [
  { user: "kalki", amount: "$200.00", status: "Pending", date: "Sep 17, 2026" },
  { user: "Radhika Thakur", amount: "$72.80", status: "Pending", date: "Sep 12, 2026" },
  { user: "PAPYA POREI", amount: "$41.00", status: "Pending", date: "Sep 17, 2026" },
  { user: "Kalyan B Mandal", amount: "$77.00", status: "Pending", date: "Sep 17, 2026" },
  { user: "Amar", amount: "$29.00", status: "Pending", date: "Sep 17, 2026" },
];

export function RecentActivityTables() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Recent Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" /> Recent Users
          </h2>
          <span className="text-xs text-gray-400">Last 5 registrations</span>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Investment</th>
                <th className="px-5 py-3 font-medium">Placed By</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{user.investment}</td>
                  <td className="px-5 py-4">
                    <span className="text-emerald-500 flex items-center gap-1 text-xs font-medium">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      {user.placedBy}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{user.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Withdrawals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" /> Recent Withdrawals
          </h2>
          <span className="text-xs text-gray-400">Last 5 requests</span>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentWithdrawals.map((withdrawal, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800">{withdrawal.user}</td>
                  <td className="px-5 py-4 text-gray-800">{withdrawal.amount}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{withdrawal.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}