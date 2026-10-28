"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserByAuthLogin,
  updateUserProfile,
  getAllCountries,
  type UpdateUserProfilePayload,
} from "../services/adminEditUsers.service";
import { toast } from "sonner";

export default function EditUserProfile() {
  const queryClient = useQueryClient();

  const [userId, setUserId] = useState("");
  const [searchId, setSearchId] = useState("");
  const [isSearched, setIsSearched] = useState(false);
  const [countryId, setCountryId] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [userData, setUserData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    code: "",
    mobile: "",
    address: "",
    wallet: "",
    authPass: "",
  });

  // ============================================
  // 🌍 Countries Query
  // ============================================
  const { data: countriesRes } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getAllCountries(),
    staleTime: 1000 * 60 * 60, // 1 hour — countries rarely change
  });

  const countries = countriesRes?.data ?? [];

  // ============================================
  // 🔍 User Query
  // ============================================
  const {
    data: res,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["user-by-auth-login", searchId],
    queryFn: () => getUserByAuthLogin(searchId),
    enabled: !!searchId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (!res) return;
    const u = res.data;
    if (res.statusCode === 200 && u) {
      setUserData({
        userName: `${u.FName ?? ""} ${u.LName ?? ""}`.trim(),
        firstName: u.FName ?? "",
        lastName: u.LName ?? "",
        email: u.Email ?? "",
        country: u.Country_Name ?? "",
        code: u.phonecode ? `+${u.phonecode}` : "",
        mobile: u.Mobile ?? "",
        address: u.Address ?? "",
        wallet: u.WalletBep20 ?? "",
        authPass: "",
      });
      setCountryId(u.CountryId ?? 0);
      setIsSearched(true);
    } else {
      setIsSearched(false);
    }
  }, [res]);

  // ============================================
  // 💾 Update Mutation
  // ============================================
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUserProfilePayload) => updateUserProfile(payload),
    onSuccess: () => {
      toast.success("Profile updated successfully ✅");
      setSuccessMsg("Profile updated successfully ✅");
      resetForm();
      queryClient.invalidateQueries({
        queryKey: ["user-by-auth-login", searchId],
      });
      setTimeout(() => setSuccessMsg(null), 3000);
    },

    onError: (err: unknown) => {
      const e = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        (status === 401 ? "Unauthorized. Please login again." : "Failed to update profile.");
      toast.error(msg);
    },
  });

  const errorMessage = (() => {
    if (!isError) return null;
    const e = error as {
      response?: { status?: number; data?: { message?: string } };
    };
    const status = e?.response?.status;
    if (status === 401) return "Unauthorized. Please login again.";
    if (status === 404) return "User not found.";
    return "Something went wrong. Please try again.";
  })();

  // ============================================
  // Handlers
  // ============================================
  const handleSearch = () => {
    const trimmed = userId.trim();
    if (!trimmed) return;
    setSuccessMsg(null);
    setSearchId(trimmed);
  };

  // Country change → countryId + phonecode + name update
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const selectedCountry = countries.find((c) => c.Country_Id === selectedId);

    setCountryId(selectedId);
    setUserData((prev) => ({
      ...prev,
      country: selectedCountry?.Country_Name ?? "",
      code: selectedCountry?.phonecode ? `+${selectedCountry.phonecode}` : prev.code,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    if (!searchId) return;

    const payload: UpdateUserProfilePayload = {
      LoginID: searchId,
      FName: userData.firstName.trim(),
      LName: userData.lastName.trim(),
      Address: userData.address.trim(),
      Email: userData.email.trim(),
      mobile: userData.mobile.trim(),
      countryid: countryId,
      WalletBep20: userData.wallet.trim(),
    };

    updateMutation.mutate(payload);
  };
  // ============================================
  // 🔄 Reset Form
  // ============================================
  const resetForm = () => {
    setUserId("");
    setSearchId("");
    setIsSearched(false);
    setCountryId(0);
    setUserData({
      userName: "",
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      code: "",
      mobile: "",
      address: "",
      wallet: "",
      authPass: "",
    });
  };

  return (
    <div className="spr-admin-edit-user flex min-h-screen w-full items-start justify-center bg-[#f5f9ff] p-4 pt-6 font-sans">
      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
          <h1 className="text-lg font-bold text-white">Edit User Profile</h1>
          <p className="mt-0.5 text-xs text-white/90">
            Update user information and manage account details
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ============ Search Box ============ */}
          <div className="mb-8 rounded-lg border border-dashed border-blue-200 bg-blue-50/60 p-5">
            <div
              className={`flex ${isSearched ? "flex-col items-end gap-5 md:flex-row" : "flex-col"}`}
            >
              {/* User ID Input + Button */}
              <div className={`${isSearched ? "flex-1" : "w-full md:w-3/4"}`}>
                <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                  USER ID *
                </label>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="flex flex-col gap-3 md:flex-row"
                >
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden
                    />
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter User ID to search"
                      aria-label="User ID"
                      className="w-full rounded-md border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={userId.trim() === "" || isLoading || isFetching}
                    className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {(isLoading || isFetching) && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading || isFetching ? "Searching..." : "Search User"}
                  </button>
                </form>

                {errorMessage && (
                  <p className="mt-2 text-xs font-medium text-red-600">{errorMessage}</p>
                )}
              </div>

              {/* User Name (sirf search ke baad) */}
              {isSearched && (
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    USER NAME
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userData.userName}
                    className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                  />
                </div>
              )}
            </div>
          </div>
          {/* ============ Search Box End ============ */}

          {/* ============ Form Area ============ */}
          {isSearched && (
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    FIRST NAME *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    LAST NAME *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    COUNTRY
                  </label>
                  <div className="relative">
                    <select
                      name="country"
                      value={countryId || ""}
                      onChange={handleCountryChange}
                      className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => (
                        <option key={c.Country_Id} value={c.Country_Id}>
                          {c.CountryFlag ? "🌐 " : ""}
                          {c.Country_Name} (+{c.phonecode})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="w-full md:w-1/4">
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    CODE
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={userData.code}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    MOBILE *
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={userData.mobile}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    ADDRESS
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                    WALLET BEP20
                  </label>
                  <input
                    type="text"
                    name="wallet"
                    value={userData.wallet}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {successMsg && <p className="text-sm font-medium text-green-600">{successMsg}</p>}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
