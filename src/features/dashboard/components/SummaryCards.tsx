"use client";

import { Loader2 } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";

export function SummaryCards() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex min-h-28 items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin text-[#1680ff]"
          aria-label="Loading dashboard data"
        />
      </div>
    );
  }

  if (isError || !data || !data.data || data.data.length === 0) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"></div>;
}
