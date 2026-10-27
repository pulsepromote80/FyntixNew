"use client"

import { useEffect, useState } from "react"
import { useWalletReportStore } from "@/store/wallet-report.store"
import { walletReportService } from "@/services/wallet-report.service"
import { getUserId } from "@/lib/auth-utils"
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  FileText,
  Clock,
  TrendingUp
} from "lucide-react"

export default function TransactionData({ transType }: { transType: string }) {
    const { transactionhistorydata, setTransactionHistory, clearTransactionHistory } = useWalletReportStore()
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
    const filteredTransactions = transactionhistorydata?.filter(transaction =>
        transaction.Remark?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.message?.toLowerCase().includes(searchTerm.toLowerCase())
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
                .velvora-gradient { background: linear-gradient(135deg, #2196F3, #3F51B5, #3F51B5); }
                .glass-effect { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
                .dark .glass-effect { background: rgba(17,24,39,0.7); }
                .gradient-border { position: relative; }
                .gradient-border::before { content: ''; position: absolute; inset: -2px; border-radius: inherit; padding: 2px; background: linear-gradient(135deg, #2196F3, #3F51B5, #3F51B5); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
            `}</style>

            <div className="wallet-reports-container">
                {/* Main Card */}
                <div className="relative overflow-hidden transition-all duration-300 border shadow-xl bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 rounded-2xl gradient-border glass-effect">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-blue-500 to-violet-500 animate-shimmer"></div>

                    {/* Header */}
                    <div className="relative p-4 sm:p-6">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-blue-500"></div>
                                <h3 className="text-lg font-bold text-gray-800 sm:text-xl dark:text-white">
                                    Income Report
                                </h3>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    {filteredTransactions.length} Records
                                </span>
                            </div>
                            
                            {/* Search */}
                            <div className="flex items-center w-full gap-2 sm:w-auto">
                                <span className="flex-shrink-0 text-xs font-bold text-gray-800 dark:text-gray-200">Search:</span>
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full py-2 pr-8 text-sm text-gray-900 placeholder-gray-400 transition-all border-2 border-gray-200 pl-9 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white dark:placeholder-gray-500"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="absolute p-1 text-gray-400 transition-colors -translate-y-1/2 rounded-lg right-2 top-1/2 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="relative px-4 pb-4 sm:px-6 sm:pb-6">
                        <div className="overflow-x-auto border rounded-xl border-gray-200/50 dark:border-gray-700/50">
                            <table className="min-w-full text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gradient-to-r from-blue-50/80 to-blue-50/80 dark:from-blue-900/20 dark:to-blue-900/20 dark:border-gray-700">
                                        <th className="px-3 py-3 text-xs font-bold tracking-wider text-center text-gray-600 uppercase sm:px-6 dark:text-gray-400 whitespace-nowrap">
                                            #
                                        </th>
                                        <th className="px-3 py-3 text-xs font-bold tracking-wider text-center text-gray-600 uppercase sm:px-6 dark:text-gray-400 whitespace-nowrap">
                                            <span className="flex items-center justify-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Date
                                            </span>
                                        </th>
                                        <th className="px-3 py-3 text-xs font-bold tracking-wider text-center text-gray-600 uppercase sm:px-6 dark:text-gray-400 whitespace-nowrap">
                                            <span className="flex items-center justify-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                Credit
                                            </span>
                                        </th>
                                        <th className="px-3 py-3 text-xs font-bold tracking-wider text-center text-gray-600 uppercase sm:px-6 dark:text-gray-400 whitespace-nowrap">
                                            <span className="flex items-center justify-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5" />
                                                Remark
                                            </span>
                                        </th>
                                      
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-xs font-bold text-center text-gray-800 dark:text-gray-200">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : currentItems.length > 0 ? (
                                        currentItems.map((rank, index) => (
                                            <tr 
                                                key={index + indexOfFirstItem} 
                                                className={`transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${
                                                    index % 2 === 0 ? "bg-white/50 dark:bg-gray-800/30" : ""
                                                }`}
                                            >
                                                <td className="px-3 sm:px-6 py-3.5 text-center text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                    {indexOfFirstItem + index + 1}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3.5 text-center text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {rank.CreatedDate || "-"}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3.5 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50">
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                        {rank?.credit || "0.00"}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3.5 text-center text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap  truncate" title={rank.Remark}>
                                                    {rank.Remark || "-"}
                                                </td>
                                             
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-xs font-bold text-center text-gray-800 dark:text-gray-200">
                                                {searchTerm ? "No transactions found matching your search." : "No transactions available."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredTransactions.length > itemsPerPage && (
                            <div className="flex flex-col items-center justify-between gap-3 pt-3 mt-4 border-t sm:flex-row border-gray-200/50 dark:border-gray-700/50">
                                <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                                    Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastItem, filteredTransactions.length)}</span> of <span className="font-semibold">{filteredTransactions.length}</span> transactions
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => paginate(1)}
                                        disabled={currentPage === 1}
                                    >
                                        «
                                    </button>
                                    <button
                                        className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        ‹
                                    </button>
                                    <span className="px-3 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        ›
                                    </button>
                                    <button
                                        className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    )
}
