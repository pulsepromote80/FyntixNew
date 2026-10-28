"use client";

import { useEffect, useState } from "react";
import { useWalletReportStore } from "@/store/wallet-report.store";
import { walletReportService } from "@/services/wallet-report.service";
import { Search, X, Calendar, DollarSign, FileText, Clock, TrendingUp } from "lucide-react";

export default function TransactionData({ transType }: { transType: string }) {
  const { transactionhistorydata, setTransactionHistory } = useWalletReportStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      setLoading(true);
      try {
        const data = await walletReportService.getTransactionHistory(transType);
        setTransactionHistory(data);
      } catch (error) {
        console.error("Failed to fetch transaction history:", error);
        setTransactionHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [transType, setTransactionHistory]);

  // Filter transactions based on search term
  const filteredTransactions =
    transactionhistorydata?.filter(
      (transaction) =>
        transaction.Remark?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.message?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="relative">
      <style>{`
                @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-shimmer { background-size: 200% 100%; animation: shimmer 3s ease-in-out infinite; }
                .animate-slideUp { animation: slideUp 0.4s ease-out; }
                .velvora-gradient { background: linear-gradient(135deg, #1680ff 0%, #25c6e8 50%, #7d75ff 100%); }
                .glass-effect { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
                .dark .glass-effect { background: rgba(11,16,33,0.82); }
                .gradient-border { position: relative; }
                .gradient-border::before { content: ''; position: absolute; inset: -2px; border-radius: inherit; padding: 2px; background: linear-gradient(135deg, #1680ff 0%, #25c6e8 50%, #7d75ff 100%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
            `}</style>

      <div className="wallet-reports-container">
        {/* Main Card */}
        <div className="gradient-border glass-effect relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-xl transition-all duration-300 dark:border-[#1E293B] dark:bg-[#0b1021]/90">
          <div className="animate-shimmer absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff]"></div>

          {/* Header */}
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#1680ff] to-[#7d75ff]"></div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white sm:text-xl">
                  Income Report
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                  {filteredTransactions.length} Records
                </span>
              </div>

              {/* Search */}
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <span className="flex-shrink-0 text-xs font-bold text-gray-800 dark:text-gray-200">
                  Search:
                </span>
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/50 py-2 pl-9 pr-8 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#1680ff] focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-[#1E293B] dark:bg-[#0b1021]/50 dark:text-white dark:placeholder-gray-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="relative px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="overflow-x-auto rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-blue-50/80 via-cyan-50/60 to-violet-50/80 dark:border-[#1E293B] dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-violet-900/20">
                    <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                      #
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                      <span className="flex items-center justify-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Date
                      </span>
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                      <span className="flex items-center justify-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Credit
                      </span>
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                      <span className="flex items-center justify-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Remark
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-xs font-bold text-gray-800 dark:text-gray-200"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((rank, index) => (
                      <tr
                        key={index + indexOfFirstItem}
                        className={`transition-colors hover:bg-blue-50/50 dark:hover:bg-cyan-900/10 ${
                          index % 2 === 0 ? "bg-white/50 dark:bg-[#111a31]/50" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-3 py-3.5 text-center text-sm font-medium text-gray-600 dark:text-gray-400 sm:px-6">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-center text-sm font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                          <span className="flex items-center justify-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {rank.CreatedDate || "-"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 sm:px-6">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 dark:border-emerald-700/50 dark:bg-emerald-900/30">
                            <DollarSign className="h-3.5 w-3.5" />
                            {rank?.credit || "0.00"}
                          </span>
                        </td>
                        <td
                          className="truncate whitespace-nowrap px-3 py-3.5 text-center text-sm font-medium text-gray-600 dark:text-gray-300 sm:px-6"
                          title={rank.Remark}
                        >
                          {rank.Remark || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-xs font-bold text-gray-800 dark:text-gray-200"
                      >
                        {searchTerm
                          ? "No transactions found matching your search."
                          : "No transactions available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredTransactions.length > itemsPerPage && (
              <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-gray-200/50 pt-3 dark:border-gray-700/50 sm:flex-row">
                <div className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                  Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(indexOfLastItem, filteredTransactions.length)}
                  </span>{" "}
                  of <span className="font-semibold">{filteredTransactions.length}</span>{" "}
                  transactions
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="rounded-lg px-3 py-1.5 text-gray-600 transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-cyan-900/30"
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  <button
                    className="rounded-lg px-3 py-1.5 text-gray-600 transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-cyan-900/30"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-cyan-300">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    className="rounded-lg px-3 py-1.5 text-gray-600 transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-cyan-900/30"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                  <button
                    className="rounded-lg px-3 py-1.5 text-gray-600 transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-cyan-900/30"
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
