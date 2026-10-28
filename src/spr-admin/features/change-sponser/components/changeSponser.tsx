

"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Users, User, UserPlus, Info, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getUserByAuthLogin,
  changeAdminSponsor,
  type ChangeSponsorPayload,
} from "../services/changeSponser.service";

export default function ChangeSponsor() {
  const [userId, setUserId] = useState("");
  const [sponsorId, setSponsorId] = useState("");

  // search button click hone par hi trigger hoga
  const [searchUser, setSearchUser] = useState(false);
  const [searchSponsor, setSearchSponsor] = useState(false);

  // ============================================
  // 🔍 User Lookup
  // ============================================
  const userQuery = useQuery({
    queryKey: ["user-lookup", userId.trim()],
    queryFn: () => getUserByAuthLogin(userId.trim()),
    enabled: searchUser && userId.trim().length > 0,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const user = userQuery.data?.data;
  const userFullName = user
    ? `${user.FName ?? ""} ${user.LName ?? ""}`.trim()
    : "";

  // ============================================
  // 🔍 Sponsor Lookup
  // ============================================
  const sponsorQuery = useQuery({
    queryKey: ["user-lookup", sponsorId.trim()],
    queryFn: () => getUserByAuthLogin(sponsorId.trim()),
    enabled: searchSponsor && sponsorId.trim().length > 0,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const sponsor = sponsorQuery.data?.data;
  const sponsorFullName = sponsor
    ? `${sponsor.FName ?? ""} ${sponsor.LName ?? ""}`.trim()
    : "";

  // ============================================
  // ✅ Change Sponsor Mutation
  // ============================================
  const changeMutation = useMutation({
    mutationFn: (payload: ChangeSponsorPayload) => changeAdminSponsor(payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Sponsor updated successfully.");
      // reset
      setUserId("");
      setSponsorId("");
      setSearchUser(false);
      setSearchSponsor(false);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Something went wrong";
      toast.error(message);
    },
  });

  // ============================================
  // Handlers
  // ============================================
  const handleSearchUser = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a User ID");
      return;
    }

    setSearchUser(true);

    try {
      const res = await userQuery.refetch();

      if (res.data?.data?.FName || res.data?.data?.LName) {
        const name = `${res.data.data.FName ?? ""} ${
          res.data.data.LName ?? ""
        }`.trim();
        toast.success(`User found: ${name || "—"}`);
      } else {
        toast.error("User not found");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Something went wrong";
      toast.error(message);
    }
  };

  const handleSearchSponsor = async () => {
    if (!sponsorId.trim()) {
      toast.error("Please enter a Sponsor ID");
      return;
    }
    if (userId.trim() && sponsorId.trim() === userId.trim()) {
      toast.error("Sponsor ID cannot be same as User ID");
      return;
    }

    setSearchSponsor(true);

    try {
      const res = await sponsorQuery.refetch();

      if (res.data?.data?.FName || res.data?.data?.LName) {
        const name = `${res.data.data.FName ?? ""} ${
          res.data.data.LName ?? ""
        }`.trim();
        toast.success(`Sponsor found: ${name || "—"}`);
      } else {
        toast.error("Sponsor not found");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Something went wrong";
      toast.error(message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sponsor || changeMutation.isPending) return;

    changeMutation.mutate({
      AuthLogin: userId.trim(),
      SponsorAuthLogin: sponsorId.trim(),
    });
  };

  // ============================================
  // Error messages (inline)
  // ============================================
  const userError = !searchUser
    ? ""
    : userQuery.isFetching
      ? ""
      : userQuery.error
        ? (
            userQuery.error as {
              response?: { data?: { message?: string } };
            }
          )?.response?.data?.message || "Something went wrong"
        : !user
          ? "User not found"
          : "";

  const sponsorError = !searchSponsor
    ? ""
    : sponsorQuery.isFetching
      ? ""
      : sponsorId.trim() && userId.trim() && sponsorId.trim() === userId.trim()
        ? "Sponsor ID cannot be same as User ID"
        : sponsorQuery.error
          ? (
              sponsorQuery.error as {
                response?: { data?: { message?: string } };
              }
            )?.response?.data?.message || "Something went wrong"
          : !sponsor
            ? "Sponsor not found"
            : "";

  const canSubmit = !!user && !!sponsor && !changeMutation.isPending;

  return (
    <div className="w-full bg-[#FAF6EC] px-3 sm:px-4 pt-2 pb-4 font-sans flex justify-center items-start">
      <div className="w-full flex flex-col gap-4 sm:gap-5">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#D4AF37] text-gray-900 mb-2 sm:mb-3 shadow-sm">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Change Sponsor
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Update sponsor association for any user
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="bg-[#D4AF37] px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Sponsor Details
            </h2>
            <p className="text-gray-800 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
              Enter user and sponsor information below
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              {/* ================= User Info ================= */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="p-1.5 bg-[#FAF6EC] rounded-md text-[#D4AF37]">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                    User Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="min-w-0">
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1.5 sm:mb-2">
                      User ID *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => {
                          setUserId(e.target.value);
                          setSearchUser(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchUser();
                          }
                        }}
                        placeholder="Enter user ID"
                        className={`flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                          userError ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleSearchUser}
                        disabled={userQuery.isFetching}
                        className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#D4AF37] text-gray-900 rounded-lg text-sm font-bold hover:bg-[#B89328] transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shrink-0"
                      >
                        {userQuery.isFetching ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">
                          {userQuery.isFetching ? "Searching..." : "Search"}
                        </span>
                      </button>
                    </div>
                    {userError && (
                      <p className="text-red-500 text-xs mt-1.5">{userError}</p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1.5 sm:mb-2">
                      User Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userFullName}
                      placeholder="User name will appear here"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* ================= Sponsor Info ================= */}
              {user && (
                <div className="mt-4 sm:mt-6 p-4 sm:p-5 rounded-xl bg-[#FFF9E6] border border-[#D4AF37]/30 animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="p-1.5 bg-[#D4AF37]/20 rounded-md text-[#D4AF37]">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                      Sponsor Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="min-w-0">
                      <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1.5 sm:mb-2">
                        Sponsor User ID *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={sponsorId}
                          onChange={(e) => {
                            setSponsorId(e.target.value);
                            setSearchSponsor(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSearchSponsor();
                            }
                          }}
                          placeholder="Enter sponsor user ID"
                          className={`flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white ${
                            sponsorError ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleSearchSponsor}
                          disabled={sponsorQuery.isFetching}
                          className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#D4AF37] text-gray-900 rounded-lg text-sm font-bold hover:bg-[#B89328] transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shrink-0"
                        >
                          {sponsorQuery.isFetching ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">
                            {sponsorQuery.isFetching
                              ? "Searching..."
                              : "Search"}
                          </span>
                        </button>
                      </div>
                      {sponsorError && (
                        <p className="text-red-500 text-xs mt-1.5">
                          {sponsorError}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1.5 sm:mb-2">
                        Sponsor Name
                      </label>
                      <input
                        type="text"
                        disabled
                        value={sponsorFullName}
                        placeholder="Sponsor name will appear here"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================= Submit ================= */}
              <div className="pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 sm:py-3 bg-[#D4AF37] text-gray-900 rounded-lg text-sm font-bold hover:bg-[#B89328] transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {changeMutation.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {changeMutation.isPending ? "Updating..." : "Change Sponsor"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= Info Box ================= */}
        <div className="bg-[#FFF9E6] border border-[#D4AF37]/30 rounded-xl p-4 sm:p-5 flex gap-3 sm:gap-4 w-full">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-1.5">
              Important Information
            </h4>
            <ul className="list-disc list-inside text-[10px] sm:text-xs text-gray-700 space-y-0.5 sm:space-y-1">
              <li>User ID and Sponsor ID cannot be the same</li>
              <li>Both User ID and Sponsor ID must be valid registered users</li>
              <li>Level Open option controls sponsor hierarchy level access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}