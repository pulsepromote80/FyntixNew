"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Bell, Loader2, RefreshCw } from "lucide-react";

type Notification = Record<string, unknown>;

function getNotificationRows(payload: unknown): Notification[] {
  const pending: unknown[] = [payload];
  const visited = new Set<object>();
  let depth = 0;

  while (pending.length && depth < 6) {
    const currentLevel = pending.splice(0);
    for (const value of currentLevel) {
      if (Array.isArray(value)) {
        if (
          value.every((item) => typeof item === "object" && item !== null && !Array.isArray(item))
        ) {
          return value.filter(
            (item): item is Notification =>
              typeof item === "object" && item !== null && !Array.isArray(item),
          );
        }
        pending.push(...value);
        continue;
      }
      if (typeof value !== "object" || value === null || visited.has(value)) continue;
      visited.add(value);

      const record = value as Record<string, unknown>;
      for (const key of ["unSeenNotificationList", "notificationList"]) {
        const rows = record[key];
        if (Array.isArray(rows)) {
          return rows.filter(
            (item): item is Notification =>
              typeof item === "object" && item !== null && !Array.isArray(item),
          );
        }
      }
      pending.push(...Object.values(record));
    }
    depth += 1;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    payload.success === false
  ) {
    throw new Error(
      "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "Could not load recent activity.",
    );
  }
  return [];
}

function getText(value: unknown): string | undefined {
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

function getActivityTitle(notification: Notification): string {
  const remarks =
    getText(notification.AdminRemarks) ??
    getText(notification.adminRemarks) ??
    getText(notification.message);
  return remarks?.split("|")[0]?.trim() || "Account notification";
}

function getActivityDate(notification: Notification): string {
  const value = notification.NotificationDate ?? notification.notificationDate;
  const date = typeof value === "string" || typeof value === "number" ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivities = useCallback(async (signal?: AbortSignal) => {
    setError("");
    try {
      const response = await fetch("/api/notifications?scope=all", { signal });
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof payload === "object" &&
            payload !== null &&
            "message" in payload &&
            typeof payload.message === "string"
            ? payload.message
            : "Could not load recent activity.",
        );
      }

      setActivities(getNotificationRows(payload));
    } catch (loadError) {
      if (loadError instanceof Error && loadError.name === "AbortError") return;
      console.error("Could not load dashboard recent activity:", loadError);
      setError(loadError instanceof Error ? loadError.message : "Could not load recent activity.");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadActivities(controller.signal);
    const interval = window.setInterval(() => {
      void loadActivities(controller.signal);
    }, 30_000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [loadActivities]);

  return (
    <section className="mt-4" aria-label="Recent activity">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.1)]">
          <Activity className="h-5 w-5 text-emerald-500" aria-hidden />
        </div>
        <div>
          <h2 className="text-lg text-gray-900 dark:text-white md:text-xl">Recent Activity</h2>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Real-time updates from your account
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50/50 to-white backdrop-blur-sm dark:border-gray-800 dark:from-gray-900/30 dark:to-transparent">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-100/30 to-transparent px-4 py-3 dark:border-gray-800 dark:from-gray-800/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
            </div>
            <span className="ml-2 text-xs font-bold text-gray-800 dark:text-gray-200">
              activity_feed.log
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 shadow-[0_0_12px_rgba(16,185,129,0.08)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400">LIVE STREAM</span>
          </div>
        </div>

        <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-800">
          <span className="inline-flex rounded-md bg-amber-500/15 px-2.5 py-1 text-[10px] text-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.1)] dark:text-amber-400">
            All Activity
          </span>
        </div>

        {error && activities.length > 0 && (
          <div
            className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
            role="status"
          >
            <span>Could not refresh activity. Showing the latest loaded items.</span>
            <button
              type="button"
              onClick={() => void loadActivities()}
              className="inline-flex shrink-0 items-center gap-1 font-semibold hover:underline"
            >
              <RefreshCw className="h-3 w-3" aria-hidden />
              Retry
            </button>
          </div>
        )}

        <div className=" overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center px-4 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#F5C451]" aria-label="Loading recent activity" />
            </div>
          ) : error && activities.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  void loadActivities();
                }}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 underline dark:text-amber-400"
              >
                <RefreshCw className="h-3 w-3" aria-hidden />
                Retry
              </button>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <Bell className="h-6 w-6 text-gray-300 dark:text-gray-600" aria-hidden />
              <p className="text-xs text-gray-500 dark:text-gray-400">No recent activity yet.</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const id =
                activity.NotificationId ??
                activity.notificationId ??
                activity.URID ??
                activity.id ??
                `activity-${index}`;
              const amount = getText(activity.Amount ?? activity.amount);

              return (
                <div
                  key={String(id)}
                  className="group flex items-start gap-3 border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Bell className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs text-gray-800 dark:text-gray-200">
                        {getActivityTitle(activity)}
                      </p>
                      {amount && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {amount}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs font-bold text-gray-600 dark:text-gray-300">
                      {getActivityDate(activity)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
