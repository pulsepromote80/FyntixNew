"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Copy,
  Download,
  Filter,
  LogIn,
  RotateCcw,
  Search,
  Shield,
  UserCheck,
  Users,
  Wallet,
  XCircle,
  DollarSign,
} from "lucide-react";
import { Spinner } from "@/spr-admin/components/ui/Spinner";
import {
  adminUsersService,
  type SearchAllUsersPayload,
} from "@/spr-admin/features/all-users/services/adminUsers.service";
import { useToastStore } from "@/spr-admin/store/toast.store";

type UserRecord = Record<string, unknown>;

const EMPTY_FILTERS: SearchAllUsersPayload = {
  AuthLogin: "",
  Fname: "",
  Active: "",
  Mobile: "",
  Email: "",
  Kid: "",
  Walletid: "",
  FromDate: "",
  ToDate: "",
};

function isRecord(value: unknown): value is UserRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findUserList(value: unknown, depth = 0): UserRecord[] | null {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }
  if (!isRecord(value) || depth > 4) {
    return null;
  }

  for (const key of ["data", "users", "items", "results", "records", "userList", "allUsers"]) {
    if (key in value) {
      const result = findUserList(value[key], depth + 1);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

function findTotal(value: unknown, fallback: number, depth = 0): number {
  if (!isRecord(value) || depth > 4) {
    return fallback;
  }
  for (const key of ["totalCount", "totalItems", "totalUsers", "totalRecords", "count"]) {
    const total = value[key];
    if (typeof total === "number" && Number.isFinite(total)) {
      return total;
    }
  }
  for (const key of ["data", "result", "pagination"]) {
    const nested = findTotal(value[key], Number.NaN, depth + 1);
    if (Number.isFinite(nested)) {
      return nested;
    }
  }
  return fallback;
}

function getField(row: UserRecord, names: string[]): unknown {
  const entries = Object.entries(row);
  for (const name of names) {
    const match = entries.find(([key]) => key.toLowerCase() === name.toLowerCase());
    if (match && match[1] !== null && match[1] !== undefined) {
      return match[1];
    }
  }
  return undefined;
}

function getText(row: UserRecord, names: string[], fallback = "—"): string {
  const value = getField(row, names);
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim() || fallback;
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return fallback;
}

function getAmount(row: UserRecord, names: string[]): number {
  const value = getField(row, names);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const amount = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(amount) ? amount : 0;
  }
  return 0;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) {
    return "—";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeCsv(value: string): string {
  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

function exportUsers(users: UserRecord[]) {
  const columns = [
    "S.No.",
    "User Login",
    "Name",
    "Mobile",
    "Email",
    "Wallet Address",
    "Package ($)",
    "Package Status",
    "Reg Date",
    "Status",
    "Actions",
  ];
  const rows = [
    columns.map(escapeCsv).join(","),
    ...users.map((user, index) =>
      [
        String(index + 1),
        getText(user, ["AuthLogin", "UserName", "Username", "Login"], ""),
        getText(user, ["Fname", "FullName", "Name", "FirstName"], ""),
        getText(user, ["Mobile", "MobileNo", "Phone", "PhoneNumber"], ""),
        getText(user, ["Email", "EmailId"], ""),
        getText(user, ["WalletAddress", "Walletid", "WalletId", "Wallet"], ""),
        formatMoney(
          getAmount(user, [
            "PackageAmount",
            "Package",
            "PackagePrice",
            "PackageValue",
            "TotalPackage",
          ]),
        ),
        getText(user, ["PacakgateStatus", "PackageStatus", "PackageName", "PackageType"], ""),
        formatDate(
          getField(user, [
            "RegDate",
            "CreatedDate",
            "JoinDate",
            "Joined",
            "CreatedAt",
            "RegistrationDate",
          ]),
        ),
        getStatus(user).label,
        "Login",
      ]
        .map((value) => escapeCsv(value))
        .join(","),
    ),
  ];
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", rows.join("\r\n")], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "users.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getStatus(user: UserRecord): { label: string; active: boolean } {
  const value = getField(user, ["Active", "Status", "IsActive"]);
  const normalized = String(value ?? "").toLowerCase();
  const active = value === true || ["1", "true", "active", "yes"].includes(normalized);
  return { label: active ? "Active" : value == null ? "Unknown" : "Inactive", active };
}

function getSearchErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return error instanceof Error ? error.message : "Failed to load users.";
}

function StatCard({
  title,
  value,
  icon: Icon,
  colors,
}: {
  title: string;
  value: string;
  icon: typeof Users;
  colors: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-l-4 border-slate-100 bg-white p-2.5 shadow-sm md:p-3 ${colors}`}
    >
      <span className="shrink-0 rounded-md bg-slate-50 p-2">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-slate-800">{value}</span>
        <span className="block truncate text-[9px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
      </span>
    </div>
  );
}

export default function UserManagement() {
  const showToast = useToastStore((state) => state.showToast);
  const [filters, setFilters] = useState<SearchAllUsersPayload>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<SearchAllUsersPayload>(EMPTY_FILTERS);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [validationError, setValidationError] = useState("");
  const [loggingInUser, setLoggingInUser] = useState<string | null>(null);
  const usersQuery = useQuery({
    queryKey: ["admin-users", "search", appliedFilters],
    queryFn: () => adminUsersService.search(appliedFilters),
    retry: false,
  });

  const users = usersQuery.data === undefined ? [] : findUserList(usersQuery.data);
  const totalUsers = users ? findTotal(usersQuery.data, users.length) : 0;
  const pageCount = Math.max(1, Math.ceil((users?.length ?? 0) / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleUsers = (users ?? []).slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeUsers = (users ?? []).filter((user) => getStatus(user).active).length;
  const adminPlaced = (users ?? []).filter((user) =>
    getText(user, ["Kid", "PlacedBy", "PlacedByName"], "").toLowerCase().includes("admin"),
  ).length;
  const totalInvestment = (users ?? []).reduce(
    (sum, user) =>
      sum + getAmount(user, ["TotalInvestment", "TotalInvest", "Investment", "TotalAmount"]),
    0,
  );
  const totalWithdrawn = (users ?? []).reduce(
    (sum, user) => sum + getAmount(user, ["TotalWithdrawn", "Withdraw", "WithdrawAmount"]),
    0,
  );

  function setFilter<K extends keyof SearchAllUsersPayload>(
    key: K,
    value: SearchAllUsersPayload[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (filters.FromDate && filters.ToDate && filters.FromDate > filters.ToDate) {
      setValidationError("Registered From date must be before Registered To date.");
      return;
    }
    setValidationError("");
    setPage(1);
    setAppliedFilters({ ...filters });
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setValidationError("");
    setPage(1);
  }

  // async function handleUserLogin(username: string) {
  //   setLoggingInUser(username);
  //   try {
  //     // Step 1: Call checkAdminUserVerify
  //     const verifyResponse = await axios.get("/api/AdminAuthentication/checkAdminUserVerify", {
  //       params: {
  //         LoginID: username,
  //       },
  //     });

  //     if (!verifyResponse.data?.data || !Array.isArray(verifyResponse.data.data) || verifyResponse.data.data.length === 0) {
  //       showToast("User verification failed: No data returned", "error");
  //       return;
  //     }

  //     const verifyData = verifyResponse.data.data[0];
  //     const authLogin = verifyData.AuthLogin;
  //     const authPass = verifyData.AuthPass;

  //     if (!authLogin || !authPass) {
  //       showToast("User verification failed: Missing credentials", "error");
  //       return;
  //     }

  //     // Step 2: Call adminUserLogin with the credentials
  //     const loginResponse = await axios.post("/api/AdminAuthentication/adminUserLogin", {
  //       userid: authLogin,
  //       password: authPass,
  //     });

  //     if (loginResponse.data?.success === false) {
  //       showToast(loginResponse.data.message || "Login failed", "error");
  //     } else {
  //       // Store tokens in localStorage for user-side
  //       const { accessToken, refreshToken } = loginResponse.data;
  //       if (accessToken) {
  //         localStorage.setItem("userAccessToken", accessToken);
  //       }
  //       if (refreshToken) {
  //         localStorage.setItem("userRefreshToken", refreshToken);
  //       }

  //       showToast("Login successful! Redirecting to dashboard...");
  //       // Redirect to user-side dashboard in new tab
  //       setTimeout(() => {
  //         window.open("https://kaliki-user.vercel.app/dashboard", "_blank");
  //       }, 1000);
  //     }
  //   } catch (error) {
  //     console.error("User login error:", error);
  //     if (axios.isAxiosError(error)) {
  //       const message = error.response?.data?.message || error.message;
  //       showToast(message, "error");
  //     } else {
  //       showToast("Login failed", "error");
  //     }
  //   } finally {
  //     setLoggingInUser(null);
  //   }
  // }

  async function handleUserLogin(username: string) {
    setLoggingInUser(username);
    try {
      const response = await axios.post("/api/spr-admin/admin/user-login", {
        LoginID: username,
      });

      const { success, message, redirect } = response.data;

      if (!success || !redirect) {
        showToast(message || "Login failed", "error");
        return;
      }

      // Decode the base64 encoded redirect URL
      const redirectUrl = atob(redirect);

      showToast("Login successful! Opening dashboard...");
      const popup = window.open(redirectUrl, "_blank");

      if (!popup || popup.closed) {
        showToast("Popup blocked! Please allow popups for this site", "error");
      }
    } catch (error) {
      console.error("User login error:", error);
      if (axios.isAxiosError(error)) {
        showToast(error.response?.data?.message || error.message, "error");
      } else {
        showToast("Login failed", "error");
      }
    } finally {
      setLoggingInUser(null);
    }
  }

  const inputClass =
    "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "mb-1 block text-[10px] font-bold uppercase text-slate-500";

  return (
    <div className="min-h-screen w-full bg-slate-50 p-2 font-sans sm:p-4">
      <header className="mb-6 flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users Management</h1>
          <p className="mt-1 text-sm text-slate-500">Full user details with limited edit access</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              try {
                exportUsers(users ?? []);
                showToast("Users CSV exported successfully");
              } catch (error) {
                console.error("Users CSV export failed:", error);
                showToast("Could not export users CSV", "error");
              }
            }}
            disabled={!users?.length}
            className="inline-flex items-center gap-2 rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </button>
        </div>
      </header>

      <section
        className="mb-4 flex w-full gap-2 overflow-x-auto pb-2 md:gap-3"
        aria-label="User statistics"
      >
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={Users}
          colors="border-l-blue-500 text-blue-500"
        />
        <StatCard
          title="Active Users"
          value={activeUsers.toLocaleString()}
          icon={CheckCircle}
          colors="border-l-green-500 text-green-500"
        />
        <StatCard
          title="Inactive Users"
          value={Math.max(0, (users?.length ?? 0) - activeUsers).toLocaleString()}
          icon={XCircle}
          colors="border-l-red-500 text-red-500"
        />
        {/* <StatCard
          title="Self Placed"
          value={Math.max(0, (users?.length ?? 0) - adminPlaced).toLocaleString()}
          icon={UserCheck}
          colors="border-l-purple-500 text-purple-500"
        /> */}
        <StatCard
          title="Total Investment"
          value={formatMoney(totalInvestment)}
          icon={DollarSign}
          colors="border-l-indigo-500 text-indigo-500"
        />
        {/* <StatCard
          title="Total Withdrawn"
          value={formatMoney(totalWithdrawn)}
          icon={Wallet}
          colors="border-l-orange-500 text-orange-500"
        /> */}
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-700" aria-hidden />
              <h2 className="text-lg font-semibold text-slate-800">All Users</h2>
            </div>
            <p className="text-xs text-slate-500">
              {usersQuery.isLoading
                ? "Loading users..."
                : `Showing ${users?.length ? (currentPage - 1) * pageSize + 1 : 0}-${Math.min(
                  currentPage * pageSize,
                  users?.length ?? 0,
                )} of ${totalUsers.toLocaleString()} users`}
            </p>
          </div>

          <form
            onSubmit={applyFilters}
            className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-6"
          >
            <div>
              <label className={labelClass} htmlFor="user-auth-login">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden />
                <input
                  id="user-auth-login"
                  value={filters.AuthLogin}
                  onChange={(event) => setFilter("AuthLogin", event.target.value)}
                  placeholder="Username"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="user-status">
                Status
              </label>
              <select
                id="user-status"
                value={filters.Active}
                onChange={(event) => setFilter("Active", event.target.value)}
                className={inputClass}
              >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="user-placed-by">
                Placed By
              </label>
              <select
                id="user-placed-by"
                value={filters.Kid}
                onChange={(event) => setFilter("Kid", event.target.value)}
                className={inputClass}
              >
                <option value="">All</option>
                <option value="Self">Self</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="user-from-date">
                Registered From
              </label>
              <input
                id="user-from-date"
                type="date"
                value={filters.FromDate}
                onChange={(event) => setFilter("FromDate", event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="user-to-date">
                Registered To
              </label>
              <input
                id="user-to-date"
                type="date"
                value={filters.ToDate}
                onChange={(event) => setFilter("ToDate", event.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={usersQuery.isFetching}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {usersQuery.isFetching ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Filter className="h-4 w-4" aria-hidden />
                )}
                Filter
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-slate-500 px-3 text-sm font-medium text-white transition hover:bg-slate-600"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Reset
              </button>
            </div>
            <div className="lg:col-span-6">
              <button
                type="button"
                onClick={() => setShowMoreFilters((shown) => !shown)}
                className="text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                {showMoreFilters ? "Hide additional filters" : "Show additional filters"}
              </button>
            </div>
            {showMoreFilters && (
              <>
                <div>
                  <label className={labelClass} htmlFor="user-first-name">
                    First Name
                  </label>
                  <input
                    id="user-first-name"
                    value={filters.Fname}
                    onChange={(event) => setFilter("Fname", event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="user-mobile">
                    Mobile
                  </label>
                  <input
                    id="user-mobile"
                    value={filters.Mobile}
                    onChange={(event) => setFilter("Mobile", event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="user-email">
                    Email
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    value={filters.Email}
                    onChange={(event) => setFilter("Email", event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="user-wallet-id">
                    Wallet ID
                  </label>
                  <input
                    id="user-wallet-id"
                    value={filters.Walletid}
                    onChange={(event) => setFilter("Walletid", event.target.value)}
                    className={inputClass}
                  />
                </div>
              </>
            )}
          </form>
        </div>

        {usersQuery.isError ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-red-700">
              {getSearchErrorMessage(usersQuery.error)}
            </p>
            <button
              type="button"
              onClick={() => void usersQuery.refetch()}
              className="mt-3 text-sm font-medium text-blue-700 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : usersQuery.data !== undefined && !users ? (
          <p className="p-8 text-center text-sm text-red-700" role="alert">
            The user search response did not contain a user list.
          </p>
        ) : usersQuery.isLoading ? (
          <div
            className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"
            role="status"
          >
            <Spinner className="h-4 w-4" />
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse text-left text-xs text-slate-700">
              <thead className="whitespace-nowrap border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  {[
                    "S.No.",
                    "User Login",
                    "Name",
                    "Mobile",
                    "Email",
                    "Wallet Address",
                    "Package ($)",
                    "Package Status",
                    "Reg Date",
                    "Status",
                    "Actions",
                  ].map((title) => (
                    <th key={title} className="px-4 py-3">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleUsers.map((user, index) => {
                  const status = getStatus(user);
                  const username = getText(user, ["AuthLogin", "UserName", "Username", "Login"]);
                  const fullName = getText(user, ["Fname", "FullName", "Name", "FirstName"]);
                  const mobile = getText(user, ["Mobile", "MobileNo", "Phone", "PhoneNumber"]);
                  const email = getText(user, ["Email", "EmailId"]);
                  const rawWalletAddress = getField(user, [
                    "WalletAddress",
                    "Walletid",
                    "WalletId",
                    "Wallet",
                  ]);
                  const walletAddress =
                    typeof rawWalletAddress === "string" ? rawWalletAddress.trim() : "";
                  const packageValue = getField(user, [
                    "PackageAmount",
                    "Package",
                    "PackagePrice",
                    "PackageValue",
                    "TotalPackage",
                  ]);
                  const packageAmount =
                    typeof packageValue === "number" || typeof packageValue === "string"
                      ? formatMoney(
                        getAmount(user, [
                          "PackageAmount",
                          "Package",
                          "PackagePrice",
                          "PackageValue",
                          "TotalPackage",
                        ]),
                      )
                      : "—";
                  const packageStatus = getText(user, [
                    "PacakgateStatus",
                    "PackageStatus",
                    "PackageName",
                    "PackageType",
                  ]);
                  const normalizedPackageStatus = packageStatus.toLowerCase();
                  const isInactivePackage =
                    normalizedPackageStatus.includes("inactive") ||
                    normalizedPackageStatus === "not active";
                  const isActivePackage =
                    !isInactivePackage &&
                    (normalizedPackageStatus.includes("active") ||
                      normalizedPackageStatus === "active");
                  const joined = getField(user, [
                    "RegDate",
                    "CreatedDate",
                    "JoinDate",
                    "Joined",
                    "CreatedAt",
                    "RegistrationDate",
                  ]);
                  return (
                    <tr
                      key={getText(user, ["UserId", "Id", "Kid"], username)}
                      className="align-top hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4 font-medium">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800">{username}</td>
                      <td className="px-4 py-4">{fullName}</td>
                      <td className="px-4 py-4">{mobile}</td>
                      <td className="px-4 py-4">{email}</td>
                      <td className="px-4 py-4">
                        {walletAddress && (
                          <div className="flex max-w-64 items-center gap-2">
                            <span className="truncate" title={walletAddress}>
                              {walletAddress}
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(walletAddress);
                                  showToast("Wallet address copied");
                                } catch (error) {
                                  console.error("Wallet address copy failed:", error);
                                  showToast("Could not copy wallet address", "error");
                                }
                              }}
                              aria-label={`Copy wallet address for ${username}`}
                              title="Copy wallet address"
                              className="shrink-0 rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Copy className="h-4 w-4" aria-hidden />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 font-medium">{packageAmount}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${isInactivePackage
                            ? "bg-red-100 text-red-700"
                            : isActivePackage
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {packageStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">{formatDate(joined)}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${status.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleUserLogin(username)}
                          disabled={loggingInUser === username}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[10px] font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Login as ${username}`}
                        >
                          {loggingInUser === username ? (
                            <Spinner className="h-3 w-3" />
                          ) : (
                            <LogIn className="h-3 w-3" aria-hidden />
                          )}
                          {loggingInUser === username ? "Logging in..." : "Login"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!visibleUsers.length && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-sm text-slate-500">
                      No users matched these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {users !== null && usersQuery.data !== undefined && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  Rows per page
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                    className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
                  >
                    {[25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    Page {currentPage} of {pageCount}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setPage(currentPage - 1)}
                      className="rounded border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= pageCount}
                      onClick={() => setPage(currentPage + 1)}
                      className="rounded border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
