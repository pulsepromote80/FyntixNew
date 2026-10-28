

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
    <div className="flex w-full items-start justify-center px-3 pb-4 pt-2 font-sans text-gray-900 dark:text-gray-100 sm:px-4">
      <div className="w-full flex flex-col gap-4 sm:gap-5">
        {/* Header */}
        <div className="text-center">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm sm:mb-3 sm:h-12 sm:w-12">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Change Sponsor
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-sm">
            Update sponsor association for any user
          </p>
        </div>

        {/* Card */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#111318]">
          <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="text-base font-bold text-white sm:text-lg">
              Sponsor Details
            </h2>
            <p className="mt-0.5 text-[10px] text-white/90 sm:mt-1 sm:text-xs">
              Enter user and sponsor information below
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              {/* ================= User Info ================= */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="rounded-md bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-base">
                    User Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 sm:mb-2 sm:text-xs">
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
                        className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-2.5 dark:bg-[#0b0d12] dark:text-gray-100 ${
                          userError ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleSearchUser}
                        disabled={userQuery.isFetching}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 sm:px-4 sm:py-2.5"
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
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{userError}</p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 sm:mb-2 sm:text-xs">
                      User Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userFullName}
                      placeholder="User name will appear here"
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 sm:px-4 sm:py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* ================= Sponsor Info ================= */}
              {user && (
                <div className="animate-in fade-in slide-in-from-top-3 mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 duration-300 sm:mt-6 sm:p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
                  <div className="mb-3 flex items-center gap-2 sm:mb-4">
                    <div className="rounded-md bg-blue-100 p-1.5 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-base">
                      Sponsor Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="min-w-0">
                      <label className="mb-1.5 block text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 sm:mb-2 sm:text-xs">
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
                          className={`min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-2.5 dark:bg-[#0b0d12] dark:text-gray-100 ${
                            sponsorError ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleSearchSponsor}
                          disabled={sponsorQuery.isFetching}
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 sm:px-4 sm:py-2.5"
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
                        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                          {sponsorError}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <label className="mb-1.5 block text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 sm:mb-2 sm:text-xs">
                        Sponsor Name
                      </label>
                      <input
                        type="text"
                        disabled
                        value={sponsorFullName}
                        placeholder="Sponsor name will appear here"
                        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 sm:px-4 sm:py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
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
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 sm:py-3"
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
        <div className="flex w-full gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:gap-4 sm:p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
          <div className="min-w-0">
            <h4 className="mb-1 text-xs font-bold text-blue-900 dark:text-blue-200 sm:mb-1.5 sm:text-sm">
              Important Information
            </h4>
            <ul className="list-inside list-disc space-y-0.5 text-[10px] text-blue-900/90 sm:space-y-1 sm:text-xs dark:text-blue-100/80">
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