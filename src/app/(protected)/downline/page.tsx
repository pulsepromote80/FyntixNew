"use client";
import React, { useEffect, useState } from "react";
import { useCommunityStore } from "@/store/community.store";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

const DownlineAffilates = () => {
  const { leftRightData, loading, fetchLeftRightData } = useCommunityStore();
  const { data: currentUserResponse } = useCurrentUser();
  const currentUser = (currentUserResponse as any)?.data;
  const loginId = currentUser?.userId || currentUser?.loginid || "";

  const [pageSize, setPageSize] = useState("");
  const [selectedRankId, setSelectedRankId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(""); // "" = All, 1-18
  const [selectedSide, setSelectedSide] = useState(""); // "" = All, "L" = Left, "R" = Right
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const itemsPerPage = 10;

  // ---------------- FETCH DATA (shared by mount + submit + reset) ----------------
  const fetchDownlineData = (lvl: string) => {
    fetchLeftRightData({
      uRank: "",
      lvl: lvl,
      statusId: ""
    });
  };

  // ---------------- INITIAL LOAD (only once on mount, no filters) ----------------
  useEffect(() => {
    fetchDownlineData("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- LEVEL CHANGE HANDLER (auto-filter on change) ----------------
  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    setCurrentPage(1);
    fetchDownlineData(value);
  };

  // ---------------- RESET HANDLER ----------------
  const handleReset = () => {
    setSearchTerm("");
    setSelectedLevel("");
    setCurrentPage(1);
    fetchDownlineData("");
  };

  // ---------------- CLEAN TABLE DATA ----------------
  const rawData = Array.isArray(leftRightData)
    ? leftRightData
    : (leftRightData as any)?.data || [];

  // NOTE: level filtering ab server-side (Submit button) se hota hai.
  // Sirf search client-side rehta hai kyunki wo turant filter hona chahiye.
  const filteredData = rawData.filter((node: any) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = node.Name?.toLowerCase().includes(s) || node.Loginid?.toLowerCase().includes(s);
    return matchesSearch;
  });

  // Total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getVisiblePages = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <>
      <div className="px-8">
        <div className="mt-2mb-5 card border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
          <div className="p-3 sm:p-3">
            {/* Filters Container */}
            <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
              {/* Left Side */}
              <div className="flex items-end gap-4 flex-wrap">
                {/* Level */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500">Select Level</label>
                  <select
                    className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
                    value={selectedLevel}
                    onChange={(e) => handleLevelChange(e.target.value)}
                  >
                    <option value="">All</option>
                    {Array.from({ length: 18 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset */}
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Reset
                </button>
              </div>

              {/* Right Side - Search */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Search</label>
                <input
                  type="text"
                  placeholder="Search by Name, Login ID"
                  className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {/* TABLE */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase whitespace-nowrap dark:text-gray-300 rounded-tl-lg">S. No.</th>

                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase whitespace-nowrap dark:text-gray-300">Login ID</th>
                    
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase whitespace-nowrap dark:text-gray-300 rounded-tr-lg">Country Flag</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase whitespace-nowrap dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase whitespace-nowrap dark:text-gray-300">Reg Date</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase whitespace-nowrap dark:text-gray-300">Topup Date</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase whitespace-nowrap dark:text-gray-300">Package</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase whitespace-nowrap dark:text-gray-300">Team Business</th>

                                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase whitespace-nowrap dark:text-gray-300">Status</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800/50 dark:divide-gray-700">
                  {loading && (
                    <tr>
                      <td colSpan={10} className="text-center p-4 text-gray-600 dark:text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredData.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center p-4 text-gray-600 dark:text-gray-400">
                        No Data Found
                      </td>
                    </tr>
                  )}

                  {displayData.map((node: any, index: number) => (
                    <tr
                      key={index}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                     

                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                        {node.Loginid || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap dark:text-gray-100">
                        {node.CountryFlag ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={node.CountryFlag}
                              alt={node.Country_Name}
                              className="w-6 h-4 object-cover rounded"
                            />
                            <span className="text-xs">{node.Country_Name || "-"}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                        {node.Name || "-"}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                        {node.RegDate || "-"}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                        {node.TopupDate || "-"}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                        {node.Package > 0 ? `$${node.Package}` : "$0"}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                        {node.TeamBusiness > 0 ? `$${node.TeamBusiness}` : "$0"}
                      </td>


                      
                      
                      <td className="px-4 py-3 text-sm whitespace-nowrap dark:text-gray-100">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
                            node.Topup === "Activated"
                              ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700/50"
                              : "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-700/50"
                          }`}
                        >
                          {node.Topup || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                {/* Previous */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-black dark:text-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>

                {getVisiblePages().map((page, index) =>
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${page}-${index}`}
                      onClick={() => typeof page === "number" && setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md border transition ${typeof page === "number" && currentPage === page
                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                        }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                {/* Next */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-black dark:text-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default DownlineAffilates;
