"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { formatCurrency } from "@/lib/utils";

export function SummaryCards() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex min-h-28 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F5C451]" aria-label="Loading dashboard data" />
      </div>
    );
  }

  if (isError || !data || !data.data || data.data.length === 0) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const dashboardData = data.data[0]!;
 

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* <Card>
        <CardHeader>
          <CardTitle>Active Licensee</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{dashboardData.ActiveLicensee || 0}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Team</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{dashboardData.TotalTeam || 0}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Yield Wallet</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{formatCurrency(dashboardData.YieldWallet || 0)}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance Wallet</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{formatCurrency(dashboardData.PerformanceWallet || 0)}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Deposit Wallet</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{formatCurrency(dashboardData.DepositWallet || 0)}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Legacy Wallet</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{formatCurrency(dashboardData.LegacyWallet || 0)}</CardContent>
      </Card> */}
    </div>
  );
}
