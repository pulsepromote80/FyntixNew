"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/spr-admin/components/ui/Card";
import { Skeleton } from "@/spr-admin/components/ui/Skeleton";
import { ErrorState } from "@/spr-admin/components/ui/ErrorState";
import { useDashboardSummary } from "@/spr-admin/features/dashboard/hooks/useDashboardSummary";
import { formatCurrency } from "@/spr-admin/lib/utils";
import {
  Activity,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Coins,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

type SummaryMetricKey =
  | "TodayBusiness"
  | "TodayDeposit"
  | "TodayDepositWallet"
  | "TodayROIwallet"
  | "TodayROIWithdrawal"
  | "TodayWorkingWallet"
  | "TodayWorkingWithdrawal"
  | "TotalActivated"
  | "TotalBusiness"
  | "TotalDepositWallet"
  | "TotalIncomeWallet"
  | "TotalIncomeWithdrawal"
  | "TotalJoining"
  | "TotalROI"
  | "TotalROIWithdrawal"
  | "TotalROIwallet"
  | "TotalWorkingWallet"
  | "TotalWorkingWithdrawal"
  | "TotalToadyJoining"
  | "NotActivated"
  | "WorkingIncomeToday"
  | "WorkingIncomeTotal";

const metricGroups: {
  title: string;
  icon: typeof Users;
  metrics: {
    key: SummaryMetricKey;
    label: string;
    type: "count" | "currency";
    fallbackKey?: "TodayDeposit";
  }[];
}[] = [
    {
      title: "Joining Overview",
      icon: Users,
      metrics: [
        { key: "TotalJoining", label: "Total Joining", type: "count" },
        { key: "TotalToadyJoining", label: "Today's Joining", type: "count" },
        { key: "TotalActivated", label: "Total Activated", type: "count" },
        { key: "NotActivated", label: "Not Activated", type: "count" },
      ],
    },
    {
      title: "Business & Deposits Wallet Overview",
      icon: BriefcaseBusiness,
      metrics: [
        { key: "TodayBusiness", label: "Today's Business", type: "currency" },
        { key: "TotalBusiness", label: "Total Business", type: "currency" },
        {
          key: "TodayDepositWallet",
          fallbackKey: "TodayDeposit",
          label: "Today's Deposit Wallet",
          type: "currency",
        },
        { key: "TotalDepositWallet", label: "Total Deposit Wallet", type: "currency" },
      ],
    },
    {
      title: "Working Wallet & Withdrawals Overview",
      icon: Wallet,
      metrics: [
        { key: "TotalWorkingWallet", label: "Total Working Wallet", type: "currency" },
        { key: "TodayWorkingWallet", label: "Today's Working Wallet", type: "currency" },
        {
          key: "TotalWorkingWithdrawal",
          label: "Total Working Withdrawal",
          type: "currency",
        },
        {
          key: "TodayWorkingWithdrawal",
          label: "Today's Working Withdrawal",
          type: "currency",
        },
      ],
    },
    {
      title: "ROI Overview",
      icon: TrendingUp,
      metrics: [
        { key: "TotalROIwallet", label: "Total ROI Wallet", type: "currency" },
        { key: "TodayROIwallet", label: "Today's ROI Wallet", type: "currency" },
        {
          key: "TotalROIWithdrawal",
          label: "Total ROI Withdrawal",
          type: "currency",
        },
        { key: "TodayROIWithdrawal", label: "Today's ROI Withdrawal", type: "currency" },
      ],
    },

  ];

export function SummaryCards() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 15 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {metricGroups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <section key={group.title} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <GroupIcon className="h-5 w-5 text-gray-600" aria-hidden />
              <h2 className="text-lg font-semibold text-gray-800">{group.title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {group.metrics.map((metric) => {
                const MetricIcon =
                  metric.type === "count"
                    ? Users
                    : metric.key.includes("ROI")
                      ? Activity
                      : metric.key.includes("Deposit")
                        ? Banknote
                        : metric.key.includes("Today")
                          ? CalendarDays
                          : Coins;
                const value =
                  metric.key === "NotActivated"
                    ? Math.max(0, data.TotalJoining - data.TotalActivated)
                    : (data[metric.key] ??
                      (metric.fallbackKey ? data[metric.fallbackKey] : undefined) ??
                      0);
                return (
                  <Card
                    key={metric.key}
                    className="border-t-4 border-t-blue-500 p-4 transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="mb-2">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {metric.label}
                      </CardTitle>
                      <div className="rounded-md bg-blue-50 p-1.5">
                        <MetricIcon className="h-4 w-4 text-blue-600" aria-hidden />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.type === "currency"
                          ? formatCurrency(value)
                          : value.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
