"use client";
import { useState } from "react";
import { useCommunityStore, type DirectMember } from "@/spr-admin/store/community.store";
import { apiClient } from "@/spr-admin/lib/api-client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Search, FileSpreadsheet, RotateCcw, Users, User, UserPlus } from "lucide-react";
import { Spinner } from "@/spr-admin/components/ui/Spinner";

export default function Affiliate() {
  const { directMemberData, loading, error, setDirectMemberData, setLoading, setError, clearData } = useCommunityStore();

  const [loginId, setLoginId] = useState("");
  const [searched, setSearched] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(500);

  // Fetch direct members when search button clicked
  const handleSearch = async () => {
    const newErrors: { title?: string } = {};
    if (!loginId.trim()) {
      newErrors.title = "User ID is required";
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/Community/getDirectMemberDetails_Admin", {
        Authlogin: loginId,
        StatusId: ""
      });
      const data = (response as { data?: unknown[] })?.data || [];
      setDirectMemberData(Array.isArray(data) ? data as DirectMember[] : []);
      setSearched(true);
      setCurrentPage(1);
    } catch (err: unknown) {
      setError({ message: err instanceof Error ? err.message : "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  // Export Excel
  const handleExport = () => {
    if (!directMemberData || directMemberData.length === 0) {
      alert("No data available to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      directMemberData.map((member, idx) => ({
        "Sr.No.": idx + 1,
        "Status": member.TopupStatus || "-",
        "Name": member.Name,
        "Login ID": member.Loginid,
        "Reg. Date": member.RegDate || "-",
        "Position": member.Position || "-",
        "Mobile": member.Mobile || "-",
        "Email": member.Email || "-",
        "Package": member.SubscriptionAmount ? `$${member.SubscriptionAmount}` : "$0",
        "Activated Date": member.SubscribeDate || "-",
        "Urank": member.Urank || "-",
        "Left Business": member.BinaryLbuss ? `$${member.BinaryLbuss}` : "$0",
        "Right Business": member.BinaryRbuss ? `$${member.BinaryRbuss}` : "$0",
        "Total Team": member.BinaryTotTeam || 0,
        "Active Team": member.BinaryActiveTeam || 0
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Direct Members");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, "DirectMembers.xlsx");
  };

  // Refresh
  const handleRefresh = () => {
    setRefreshLoading(true);
    setTimeout(() => {
      setLoginId("");
      setSearched(false);
      setCurrentPage(1);
      setErrors({});
      clearData();
      setRefreshLoading(false);
    }, 1000);
  };

  // Pagination calculation
  const totalPages = Math.ceil(directMemberData?.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = directMemberData?.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Direct Partners</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your direct partner network</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
            <Users className="w-3.5 h-3.5" />
            {directMemberData?.length || 0} Partners
          </span>
        </div>
      </div>

      {/* Search Section */}
      <div className="p-6 border border-border rounded-lg bg-card shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* User ID Input */}
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              <User className="inline w-4 h-4 mr-2" />
              User ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className={`w-full px-4 py-2.5 pl-10 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all ${errors.title
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-input"
                  }`}
                placeholder="Enter User ID"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {errors.title && (
              <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
                {errors.title}
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner className="w-4 h-4 text-white" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <button
              onClick={handleRefresh}
              disabled={refreshLoading}
              className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshLoading ? <Spinner className="w-4 h-4 text-white" /> : <RotateCcw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {searched && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card shadow-sm">
              <Spinner className="w-8 h-8 text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading affiliates...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card shadow-sm">
              <div className="p-4 bg-destructive/10 rounded-full">
                <svg className="w-12 h-12 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-medium text-destructive">{error.message || "Something went wrong"}</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-border rounded-lg bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border-collapse">
                  {/* Table Header */}
                  <thead className="bg-muted">
                    <tr>
                      {[
                        "Sr No",
                        "Status",
                        "Name",
                        "Login ID",
                        "Reg. Date",
                        "Position",
                        "Mobile",
                        "Email",
                        "Package",
                        "Activated Date",
                        "Urank",
                        "Left Business",
                        "Right Business",
                        "Total Team",
                        "Active Team"
                      ].map((heading, i) => (
                        <th
                          key={i}
                          className="px-4 py-3.5 text-xs font-semibold tracking-wider text-foreground uppercase border-b border-border whitespace-nowrap"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-border">
                    {paginatedData?.length === 0 ? (
                      <tr>
                        <td colSpan={15} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <UserPlus className="w-16 h-16 mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium text-foreground">No Data Found</p>
                            <p className="mt-1 text-sm text-muted-foreground">No affiliates found for this user</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData?.map((member, idx) => (
                        <tr
                          key={idx}
                          className={`transition-colors duration-200 hover:bg-muted/50 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                            }`}
                        >
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap font-medium text-foreground">
                            {startIndex + idx + 1}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap">
                            <span className="flex items-center justify-center gap-2">
                              {member.TopupStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap font-medium text-foreground">
                            {member.Name}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap text-muted-foreground">
                            {member.Loginid}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap text-muted-foreground">
                            {member.RegDate}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap font-semibold text-primary">
                            {member.Position}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap text-muted-foreground">
                            {member.Mobile}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap text-muted-foreground">
                            {member.Email}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap font-semibold text-foreground">
                            ${member.SubscriptionAmount}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap text-muted-foreground">
                            {member.SubscribeDate || "-"}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap text-muted-foreground">
                            {member.Urank}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap font-semibold text-green-600">
                            ${member.BinaryLbuss}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap font-medium text-foreground">
                            ${member.BinaryRbuss}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap text-muted-foreground">
                            {member.BinaryTotTeam}
                          </td>
                          <td className="px-4 py-3.5 border-b border-border whitespace-nowrap text-muted-foreground">
                            {member.BinaryActiveTeam}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {directMemberData?.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 px-4 py-4 border-t border-border sm:flex-row bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    >
                      <option value="500">500</option>
                      <option value="1000">1000</option>
                      <option value="1500">1500</option>
                    </select>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-foreground">{Math.min(endIndex, directMemberData?.length)}</span> of{' '}
                    <span className="font-semibold text-foreground">{directMemberData?.length}</span> affiliates
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md transition-colors ${currentPage === 1
                        ? "text-muted-foreground cursor-not-allowed"
                        : "text-primary hover:bg-primary/10"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md transition-colors ${currentPage === totalPages
                        ? "text-muted-foreground cursor-not-allowed"
                        : "text-primary hover:bg-primary/10"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}