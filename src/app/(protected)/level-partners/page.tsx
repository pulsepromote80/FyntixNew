"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useCommunityStore } from "@/store/community.store";
import { communityService } from "@/services/community.service";
import { toast } from "sonner";

interface PersonalTeamMember {
  uLvl?: number;
  Loginid?: string;
  SponsorId?: string;
  Name?: string;
  RegDate?: string;
  Email?: string;
  Mobile?: string;
  Urank?: string;
  status?: string;
  SubscriptionAmount?: number;
  SubscribeDate?: string;
  DeployDate?: string;
  TeamBusiness?: number;
  ActiveTeam?: number;
  totTeam?: number;
  Package?: number;
  CountryFlag?: string;
  CountryId?: number;
}

interface Rank {
  rankId: string;
  uRank: string;
}

const LevelPartner = () => {
  const {
    personalTeamData,
    loading,
    error,
    setPersonalTeamData,
    setLoading,
    setError,
  } = useCommunityStore();

  const [pageSize, setPageSize] = useState("");
  const [selectedRankId, setSelectedRankId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rankList, setRankList] = useState<Rank[]>([]);
  const itemsPerPage = 10;

  // ---------------- GET ALL RANK ----------------
  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const response = await communityService.getRank();
        if (response.data) {
          setRankList(response.data);
        }
      } catch (error) {
        console.error("Error fetching ranks:", error);
        // If rank API fails, continue without ranks
      }
    };

    fetchRanks();
  }, []);

  // ---------------- CALL TEAM API ----------------
  useEffect(() => {
    const fetchPersonalTeam = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = {
          uRank: selectedRankId,
          lvl: pageSize,
          statusId: "",
        };

        const response = await communityService.getPersonalTeam(data);

        if (response.data) {
          setPersonalTeamData(response.data);
        }
      } catch (error) {
        console.error("Error fetching personal team:", error);
        setError("Failed to fetch personal team");
        toast.error("Failed to fetch personal team");
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalTeam();
  }, [selectedRankId, pageSize, setLoading, setError, setPersonalTeamData]);

  // ---------------- CLEAN TABLE DATA ----------------
  const rawData = Array.isArray(personalTeamData)
    ? personalTeamData
    : [];

  const filteredData = rawData.filter((node: PersonalTeamMember) => {
    const s = searchTerm.toLowerCase();
    return (
      node.Name?.toLowerCase().includes(s) ||
      node.Loginid?.toLowerCase().includes(s) ||
      node.Email?.toLowerCase().includes(s) ||
      node.SponsorId?.toLowerCase().includes(s)
    );
  });

  // Total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRankId, pageSize]);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5; // center me kitne pages dikhane

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
      <div className="mt-2 mb-5 bg-white border border-gray-200 card dark:bg-gray-900 dark:border-gray-700">
        <div className="p-2 sm:p-2">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 text-sm text-black placeholder-gray-400 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800 geidt-font"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex gap-2">
              {/* Dynamic Rank Filter (uRank from API) */}
              <select
                className="px-3 py-2 text-sm text-black bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800 geidt-font"
                value={selectedRankId}
                onChange={(e) => setSelectedRankId(e.target.value)}
              >
                <option value="">Select Rank</option>

                {rankList
                  ?.filter((item) => Number(item.rankId) <= 15)
                  ?.map((r) => (
                    <option key={r.rankId} value={r.uRank}>
                      {r.uRank}
                    </option>
                  ))}
              </select>

              {/* Level Filter (1–15) */}
              <select
                className="px-3 py-2 text-sm text-black bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800 geidt-font"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
              >
                <option value="">Select Level</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-auto border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="font-semibold text-blue-700 bg-blue-50 dark:bg-gray-800 dark:text-blue-400">
                <tr>
                  <th className="px-2 py-1 py-2 text-left text-black dark:text-gray-100">S.N.</th>
                  <th className="px-2 py-1 py-2 text-left text-black dark:text-gray-100">Country</th>

                  <th className="px-2 py-1 py-2 text-left text-black dark:text-gray-100">Name</th>
                  <th className="px-2 py-1 py-2 text-left text-black dark:text-gray-100">
                    Login ID
                  </th>
                  <th className="px-2 py-1 py-2 text-left text-black dark:text-gray-100">Email</th>
                  <th className="px-2 py-1 py-2 text-left text-black dark:text-gray-100">
                    Sponsor ID
                  </th>
                  <th className="px-2 py-1 py-2 text-left text-black dark:text-gray-100">Reg. Date</th>
                            <th className="px-2 py-1 py-2 text-left text-black dark:text-gray-100">Activation Date</th>
                  <th className="px-2 py-1 py-2 text-left text-black whitespace-nowrap dark:text-gray-100">
                    Package
                  </th>
                  

                  <th className="px-2 py-1 py-2 text-left text-black dark:text-gray-100">Rank</th>
                  
                
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-900">
                {loading && (
                  <tr>
                    <td colSpan={13} className="p-4 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#F5C451]" aria-label="Loading" />
                    </td>
                  </tr>
                )}

                {error && (
                  <tr>
                    <td colSpan={13} className="p-4 text-center text-red-600 dark:text-red-400">
                      Error: {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredData.length === 0 && (
                  <tr>
                    <td colSpan={13} className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No Data Found
                    </td>
                  </tr>
                )}

                {displayData.map((node: PersonalTeamMember, index: number) => (
                  <tr
                    key={index}
                    className="transition hover:bg-blue-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-black dark:text-gray-100">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">

                        <img
                          src={node.CountryFlag}
                          alt="flag"
                          className="object-cover w-6 h-4"
                        />
                      </div>
                    </td>

                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <span className="px-2 py-1 text-black whitespace-nowrap dark:text-gray-100">{node.Name} </span>
                    </td>

                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <span className="px-2 py-1 text-black dark:text-gray-100">{node.Loginid}</span>
                    </td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <span className="px-2 py-1 text-red-600 bg-red-100 rounded dark:text-red-400 dark:bg-red-900/30">
                        {node.Email}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <span className="px-2 py-1 text-black dark:text-gray-100">
                        {node.SponsorId}
                      </span>
                    </td>

                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <span className="px-2 py-1 text-black dark:text-gray-100">{node.RegDate}</span>
                    </td>
                      <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <span className="px-2 py-1 text-black dark:text-gray-100">{node.SubscribeDate}</span>
                    </td>

                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <span className="px-2 py-1 text-black dark:text-gray-100">
                        {Number(node.Package) > 0
                          ? `$${Number(node.Package).toFixed(2)}`
                          : "$0"}
                      </span>
                    </td>

                   
                    
                   


                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <span className="px-2 py-1 text-blue-600 bg-blue-100 rounded dark:text-blue-400 dark:bg-blue-900/30">
                        {node.Urank}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {/* Previous */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 text-sm text-black bg-gray-100 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
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
                    key={`page-${page}-${index}`} // ✅ UNIQUE KEY
                    onClick={() => setCurrentPage(Number(page))}
                    className={`px-3 py-1 text-sm rounded-md border transition ${currentPage === page
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
                className="px-3 py-1 text-sm text-black bg-gray-100 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LevelPartner;
