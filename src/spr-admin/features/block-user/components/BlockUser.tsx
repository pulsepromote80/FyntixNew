"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Search, Shield, UserRound, UserRoundX } from "lucide-react";
import { ConfirmDialog } from "@/spr-admin/components/common/ConfirmDialog";
import { Spinner } from "@/spr-admin/components/ui/Spinner";
import {
  blockUserService,
  type BlockUserPayload,
} from "@/spr-admin/features/block-user/services/blockUser.service";
import { useToastStore } from "@/spr-admin/store/toast.store";

type UserRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UserRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getUserRecord(value: unknown, depth = 0): UserRecord | null {
  if (Array.isArray(value)) {
    return value.find(isRecord) ?? null;
  }
  if (!isRecord(value) || depth > 4) {
    return null;
  }

  if (
    Object.keys(value).some((key) =>
      ["authlogin", "userid", "username", "name", "fname"].includes(key.toLowerCase()),
    )
  ) {
    return value;
  }

  for (const key of ["data", "user", "users", "result", "items"]) {
    if (key in value) {
      const user = getUserRecord(value[key], depth + 1);
      if (user) {
        return user;
      }
    }
  }
  return null;
}

function getUserField(user: UserRecord, names: string[]): unknown {
  const entries = Object.entries(user);
  for (const name of names) {
    const match = entries.find(([key]) => key.toLowerCase() === name.toLowerCase());
    if (match && match[1] !== null && match[1] !== undefined) {
      return match[1];
    }
  }
  return undefined;
}

function getText(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function getStatus(user: UserRecord): { label: string; isActive: boolean | null } {
  const value = getUserField(user, ["activeStatus", "Active", "Status", "IsActive"]);
  const normalized = String(value ?? "").toLowerCase();
  if (value === true || ["1", "true", "active", "yes"].includes(normalized)) {
    return { label: "Active", isActive: true };
  }
  if (
    value === false ||
    ["0", "false", "inactive", "deactive", "blocked", "no"].includes(normalized)
  ) {
    return { label: "Blocked", isActive: false };
  }
  return { label: "Unknown", isActive: null };
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return error instanceof Error ? error.message : "The request failed.";
}

function getLookupErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return "User not found.";
  }
  return getErrorMessage(error);
}

function getResponseMessage(response: unknown, fallback: string): string {
  if (!isRecord(response)) {
    return fallback;
  }
  for (const key of ["message", "Message", "detail", "Detail"]) {
    if (typeof response[key] === "string" && response[key].trim()) {
      return response[key];
    }
  }
  return fallback;
}

function isFailedResponse(response: unknown): boolean {
  return (
    isRecord(response) &&
    (response.success === false ||
      response.Success === false ||
      (typeof response.statusCode === "number" && response.statusCode >= 400))
  );
}

export default function BlockUser() {
  const showToast = useToastStore((state) => state.showToast);
  const [authLogin, setAuthLogin] = useState("");
  const [debouncedLogin, setDebouncedLogin] = useState("");
  const [active, setActive] = useState<0 | 1>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedLogin(authLogin.trim());
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [authLogin]);

  const lookupQuery = useQuery({
    queryKey: ["admin-user-lookup", debouncedLogin],
    queryFn: () => blockUserService.lookup(debouncedLogin),
    enabled: Boolean(debouncedLogin),
    retry: false,
  });
  const user = lookupQuery.data === undefined ? null : getUserRecord(lookupQuery.data);
  const isLookupCurrent = authLogin.trim() === debouncedLogin;
  const selectedUser = isLookupCurrent ? user : null;
  const status = selectedUser ? getStatus(selectedUser) : null;

  const updateStatus = useMutation({
    mutationFn: async (payload: BlockUserPayload) => {
      const response = await blockUserService.updateStatus(payload);
      if (isFailedResponse(response)) {
        throw new Error(getResponseMessage(response, "Failed to update user status."));
      }
      return response;
    },
    onSuccess: (response, payload) => {
      showToast(
        getResponseMessage(
          response,
          payload.active === 0 ? "User blocked successfully." : "User unblocked successfully.",
        ),
      );
      setAuthLogin("");
      setDebouncedLogin("");
      setActive(0);
      setIsConfirmOpen(false);
    },
    onError: (error) => {
      showToast(getErrorMessage(error), "error");
    },
  });

  function submitStatus() {
    if (!selectedUser || updateStatus.isPending) {
      return;
    }
    if (active === 0) {
      setIsConfirmOpen(true);
      return;
    }
    updateStatus.mutate({ authLogin: authLogin.trim(), active });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitStatus();
  }

  function confirmBlock() {
    updateStatus.mutate({ authLogin: authLogin.trim(), active: 0 });
  }

  const userName = selectedUser
    ? getText(getUserField(selectedUser, ["name", "userName", "Fname", "FullName", "FirstName"]))
    : "";
  const userEmail = selectedUser ? getText(getUserField(selectedUser, ["email", "EmailId"])) : "";
  const userMobile = selectedUser
    ? getText(getUserField(selectedUser, ["mobile", "MobileNo", "Phone"]))
    : "";
  const userCountry = selectedUser
    ? getText(getUserField(selectedUser, ["country_Name", "countryName", "Country"]))
    : "";
  const canSubmit = Boolean(selectedUser && isLookupCurrent && !lookupQuery.isFetching);

  return (
    <div className="w-full">
      <div className="px-2 flex w-full max-w-3xl flex-col gap-5">
        <header className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-gray-900 shadow-sm">
            <UserRoundX className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Block User</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Block or restore a user&apos;s access to the platform
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  Review the user before changing access
                </h2>
                <p className="mt-1 text-sm text-amber-800">
                  Blocking prevents the user from accessing the platform. You can unblock them
                  later.
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-6 p-5 sm:p-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="block-user-login"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                User ID
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  id="block-user-login"
                  type="search"
                  autoComplete="off"
                  value={authLogin}
                  onChange={(event) => setAuthLogin(event.target.value)}
                  placeholder="Enter user ID"
                  disabled={updateStatus.isPending}
                  aria-describedby="block-user-lookup-status"
                  className="h-11 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
                />
              </div>
              <div
                id="block-user-lookup-status"
                className="mt-2 min-h-5 text-sm"
                aria-live="polite"
              >
                {authLogin.trim() && (!isLookupCurrent || lookupQuery.isFetching) && (
                  <span className="inline-flex items-center gap-2 text-gray-500">
                    <Spinner className="h-4 w-4" />
                    Searching for user...
                  </span>
                )}
                {isLookupCurrent && lookupQuery.isError && (
                  <span className="text-red-600">{getLookupErrorMessage(lookupQuery.error)}</span>
                )}
                {isLookupCurrent && lookupQuery.isSuccess && !selectedUser && (
                  <span className="text-red-600">User not found.</span>
                )}
                {canSubmit && (
                  <span className="inline-flex items-center gap-1.5 text-green-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    User found
                  </span>
                )}
              </div>
            </div>

            {selectedUser && status && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-gray-800">
                      <UserRound className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {userName || authLogin.trim()}
                      </p>
                      <p className="truncate text-sm text-gray-500">{authLogin.trim()}</p>
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Email
                    </dt>
                    <dd className="mt-1 break-all text-gray-800">{userEmail || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Mobile
                    </dt>
                    <dd className="mt-1 text-gray-800">{userMobile || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Country
                    </dt>
                    <dd className="mt-1 text-gray-800">{userCountry || "—"}</dd>
                  </div>
                </dl>
              </div>
            )}

            {selectedUser && (
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-gray-700">
                  Choose an action
                </legend>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="user-status"
                      value="block"
                      checked={active === 0}
                      onChange={() => setActive(0)}
                      disabled={updateStatus.isPending}
                      className="h-4 w-4 accent-red-600"
                    />
                    Block user
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="user-status"
                      value="unblock"
                      checked={active === 1}
                      onChange={() => setActive(1)}
                      disabled={updateStatus.isPending}
                      className="h-4 w-4 accent-green-600"
                    />
                    Unblock user
                  </label>
                </div>
              </fieldset>
            )}

            <button
              type="submit"
              disabled={!canSubmit || updateStatus.isPending}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 ${active === 0 ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {updateStatus.isPending ? (
                <>
                  <Spinner className="h-4 w-4 text-white" />
                  Updating status...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" aria-hidden />
                  {active === 0 ? "Block User" : "Unblock User"}
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Block this user?"
        description={`This will block ${userName || authLogin.trim()} from accessing the platform. Continue?`}
        confirmLabel="Block user"
        isDestructive
        isLoading={updateStatus.isPending}
        onConfirm={confirmBlock}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
