"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RotateCcw,
  Search,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { getBoosterHistory, type BoosterHistoryPayload } from "../services/boosterHistory.service";

function formatBackendDate(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function escapeCsv(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export default function BoosterHistory() {
  const [authLogin, setAuthLogin] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [boosterType, setBoosterType] = useState("0");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchPayload, setSearchPayload] = useState<BoosterHistoryPayload>({
    AuthLogin: "",
    FromDate: "",
    ToDate: "",
    BoosterType: 0,
  });

  const historyQuery = useQuery({
    queryKey: ["booster-history", searchPayload],
    queryFn: () => getBoosterHistory(searchPayload),
    retry: false,
    staleTime: 0,
  });

  const history = historyQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(history.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = history.slice(startIndex, startIndex + rowsPerPage);
  const totalBoosterValue = history.reduce(
    (total, row) => total + (Number(row.BoosterValue) || 0),
    0,
  );

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fromDate && toDate && fromDate > toDate) {
      toast.error("From Date cannot be later than To Date.");
      return;
    }

    setCurrentPage(1);
    setSearchPayload({
      AuthLogin: authLogin.trim(),
      FromDate: formatBackendDate(fromDate),
      ToDate: formatBackendDate(toDate),
      BoosterType: Number(boosterType),
    });
  };

  const handleReset = () => {
    const isAlreadyUnfiltered =
      searchPayload.AuthLogin === "" &&
      searchPayload.FromDate === "" &&
      searchPayload.ToDate === "" &&
      searchPayload.BoosterType === 0;
    setAuthLogin("");
    setFromDate("");
    setToDate("");
    setBoosterType("0");
    setCurrentPage(1);
    setSearchPayload({
      AuthLogin: "",
      FromDate: "",
      ToDate: "",
      BoosterType: 0,
    });
    if (isAlreadyUnfiltered) void historyQuery.refetch();
  };

  const handleExport = () => {
    if (!history.length) {
      toast.error("No data to export");
      return;
    }

    const rows = [
      ["No.", "User ID", "Name", "Booster Value", "Remark", "Created Date", "Email"],
      ...history.map((item, index) => [
        index + 1,
        item.AuthLogin,
        item.FullName,
        item.BoosterValue,
        item.Remark,
        item.CreatedDate,
        item.email,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `booster-history-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const errorMessage =
    historyQuery.error instanceof Error
      ? historyQuery.error.message
      : "Unable to load booster history. Please try again.";

  return (
    <div className="flex w-full items-start justify-center bg-[#FAF6EC] px-4 pb-4 pt-1 font-sans">
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-gray-900 shadow-sm">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booster History</h1>
              <p className="mt-0.5 text-sm text-gray-500">Review user booster transactions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={!history.length || historyQuery.isFetching}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-[#B89328] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[#D4AF37] px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Search className="h-5 w-5" />
              Search Filters
            </h2>
            <p className="mt-1 text-xs text-gray-800">
              Filter booster history by user, date, or type
            </p>
          </div>
          <form className="p-6" onSubmit={handleSearch}>
            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs font-bold uppercase text-gray-500">
                <span className="mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#D4AF37]" /> User ID
                </span>
                <input
                  value={authLogin}
                  onChange={(event) => setAuthLogin(event.target.value)}
                  placeholder="Enter user ID"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </label>
              <label className="text-xs font-bold uppercase text-gray-500">
                <span className="mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" /> From Date
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </label>
              <label className="text-xs font-bold uppercase text-gray-500">
                <span className="mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" /> To Date
                </span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </label>
              <label className="text-xs font-bold uppercase text-gray-500">
                <span className="mb-1.5 block">Booster Type</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={boosterType}
                  onChange={(event) => setBoosterType(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
              <button
                type="submit"
                disabled={
                  historyQuery.isFetching ||
                  !Number.isInteger(Number(boosterType)) ||
                  Number(boosterType) < 0
                }
                className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-[#B89328] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                {historyQuery.isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {historyQuery.isFetching ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-[#D4AF37]/30 bg-[#FFF9E6] px-6 py-3 sm:flex-row sm:items-center">
            <span className="text-sm font-bold text-gray-800">
              {historyQuery.isFetching
                ? "Loading booster history..."
                : `${history.length} booster record(s)`}
            </span>
            <span className="text-xs text-gray-600">
              Total Booster Value: <strong className="text-green-700">${totalBoosterValue}</strong>
            </span>
          </div>

          {historyQuery.isError ? (
            <div role="alert" className="px-6 py-12 text-center text-sm text-red-600">
              {errorMessage}
            </div>
          ) : historyQuery.isFetching ? (
            <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : history.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No booster history found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#FAF6EC] text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      <th className="border-r border-gray-200 px-3 py-3 text-center">#</th>
                      <th className="border-r border-gray-200 px-3 py-3">User ID</th>
                      <th className="border-r border-gray-200 px-3 py-3">Name</th>
                      <th className="border-r border-gray-200 px-3 py-3 text-right">
                        Booster Value
                      </th>
                      <th className="border-r border-gray-200 px-3 py-3">Remark</th>
                      <th className="border-r border-gray-200 px-3 py-3">Created Date</th>
                      <th className="px-3 py-3">Email</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700">
                    {currentRows.map((item, index) => (
                      <tr
                        key={`${item.RowNo}-${item.AuthLogin}-${index}`}
                        className="border-b border-gray-100 transition-colors hover:bg-[#FFF9E6]/40"
                      >
                        <td className="border-r border-gray-100 px-3 py-4 text-center">
                          {item.RowNo || startIndex + index + 1}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.AuthLogin || "—"}
                        </td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4 font-medium text-gray-800">
                          {item.FullName || "—"}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4 text-right font-bold text-green-700">
                          ${item.BoosterValue}
                        </td>
                        <td className="border-r border-gray-100 px-3 py-4">{item.Remark || "—"}</td>
                        <td className="whitespace-nowrap border-r border-gray-100 px-3 py-4">
                          {item.CreatedDate || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">{item.email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-6 py-3 md:flex-row">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  Rows per page:
                  <select
                    value={rowsPerPage}
                    onChange={(event) => {
                      setRowsPerPage(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded border border-gray-300 bg-white px-2 py-1"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </label>
                <span className="text-xs text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, history.length)}{" "}
                  of {history.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
