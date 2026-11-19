"use client";

import React, { useState } from "react";
import { isAxiosError } from "axios";
import { Users, Search, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getUserByAuthLogin } from "../../edit-user/services/adminEditUsers.service";
import { proxyApiClient } from "@/spr-admin/lib/proxy-client";

// ============================================
// Types
// ============================================

interface UserData {
  FName?: string;
  LName?: string;
}

interface UserSearchResponse {
  statusCode: number;
  message?: string;
  data?: UserData;
}

interface LevelResult {
  statusCode: number;
  message: string;
}

interface OpenLevelResponse {
  statusCode?: number;
  message?: string;
  data?: LevelResult[];
}

type OpenLevelApiResponse = OpenLevelResponse | LevelResult[];

interface ApiErrorResponse {
  message?: string;
  Message?: string;
}

// ============================================
// Component
// ============================================

export default function OpenLevel() {
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // User Search API
  // ============================================

  const {
    mutateAsync: searchUser,
    isPending: isSearching,
  } = useMutation<UserSearchResponse, unknown, string>({
    mutationFn: async (id: string): Promise<UserSearchResponse> => {
      const response: unknown = await getUserByAuthLogin(id);
      return response as UserSearchResponse;
    },
  });

  // ============================================
  // User Details
  // ============================================

  const isSearched = !!userData;

  const userName = userData
    ? `${userData.FName ?? ""} ${userData.LName ?? ""}`.trim()
    : "";

  // ============================================
  // Error Handler
  // ============================================

  const getErrorMessage = (err: unknown): string => {
    if (isAxiosError<ApiErrorResponse>(err)) {
      const status = err.response?.status;

      if (status === 401) {
        return "Unauthorized. Please login again.";
      }

      if (status === 404) {
        return "User not found.";
      }

      return (
        err.response?.data?.message ||
        err.response?.data?.Message ||
        err.message ||
        "Something went wrong. Please try again."
      );
    }

    if (err instanceof Error) {
      return err.message;
    }

    return "Something went wrong. Please try again.";
  };

  // ============================================
  // Search User Handler
  // ============================================

  const handleSearchUser = async () => {
    const trimmed = userId.trim();

    if (!trimmed) {
      toast.error("Please enter a User ID");
      return;
    }

    // Reset previous user data
    setUserData(null);
    setIsLevelOpen(false);

    const searchPromise = searchUser(trimmed);

    toast.promise(searchPromise, {
      loading: "Searching user...",

      success: (res) => {
        if (res.statusCode !== 200 || !res.data) {
          throw new Error("User not found.");
        }

        const name = `${res.data.FName ?? ""} ${
          res.data.LName ?? ""
        }`.trim();

        return `User found successfully${name ? `: ${name}` : ""}`;
      },

      error: (err: unknown) => getErrorMessage(err),
    });

    try {
      const result = await searchPromise;

      if (result.statusCode === 200 && result.data) {
        setUserData(result.data);
      }
    } catch (error: unknown) {
      console.error("User search failed:", error);
    }
  };

  // ============================================
  // Open Level API Handler
  // ============================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!isSearched || !isLevelOpen) {
      toast.error("Please enable level open first");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    const submitPromise = (async (): Promise<string> => {
      const payload = {
        AuthLogin: userId.trim(),
      };

      // proxyApiClient already returns response.data
      const result = await proxyApiClient.post<OpenLevelApiResponse>(
        "/proxy/AdminManageUser/updatelvlAdmin",
        payload
      );

      let levelResult: LevelResult | undefined;
      let responseMessage = "";

      // Case 1: API returns direct array
      if (Array.isArray(result)) {
        levelResult = result[0];
      } else {
        // Case 2: API returns object with data array
        if (
          result.statusCode !== undefined &&
          result.statusCode !== 200
        ) {
          throw new Error(
            result.message || "Failed to open level."
          );
        }

        responseMessage = result.message || "";
        levelResult = result.data?.[0];
      }

      // Validate API response
      if (!levelResult) {
        throw new Error("Invalid API response. Please try again.");
      }

      if (levelResult.statusCode !== 1) {
        throw new Error(
          levelResult.message || "Failed to open level."
        );
      }

      return (
        levelResult.message ||
        responseMessage ||
        "Level opened successfully."
      );
    })();

    toast.promise(submitPromise, {
      loading: "Opening user level...",
      success: (message) => message,
      error: (err: unknown) => getErrorMessage(err),
    });

    try {
      await submitPromise;
    } catch (error: unknown) {
      console.error("Open level API error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // JSX
  // ============================================

  return (
    <div className="w-full p-4 pt-6 pb-24 font-sans flex justify-center items-start">
      <div className="bg-white rounded-xl border border-gray-200 w-full max-w-5xl overflow-hidden shadow-sm">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-white">
                Open Level
              </h1>

              <p className="text-white/90 text-xs mt-0.5">
                Enable level for user
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* Search Box */}
          <div className="mb-8 rounded-lg border border-dashed border-blue-200 p-5">
            <div
              className={`flex ${
                isSearched
                  ? "flex-col items-end gap-5 md:flex-row"
                  : "flex-col"
              }`}
            >

              {/* User ID Input */}
              <div
                className={`${
                  isSearched ? "flex-1" : "w-full md:w-3/4"
                }`}
              >
                <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                  USER ID *
                </label>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchUser();
                  }}
                  className="flex flex-col gap-3 md:flex-row"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter User ID to search"
                      className="w-full rounded-md border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!userId.trim() || isSearching}
                    className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 min-w-[130px]"
                  >
                    {isSearching && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {isSearching ? "Searching..." : "Search User"}
                  </button>
                </form>
              </div>

              {/* User Name */}
              {isSearched && (
                <div className="flex-1 animate-in fade-in duration-300">
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    USER NAME
                  </label>

                  <input
                    type="text"
                    disabled
                    value={userName}
                    className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Area */}
          {isSearched && (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 animate-in fade-in duration-300"
            >

              {/* Checkbox */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <input
                  type="checkbox"
                  id="levelOpen"
                  checked={isLevelOpen}
                  onChange={(e) => setIsLevelOpen(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />

                <label
                  htmlFor="levelOpen"
                  className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                >
                  Level Open
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={!isLevelOpen || isSubmitting}
                  className="w-full py-3 bg-[#1680ff] text-white rounded-md font-bold text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
