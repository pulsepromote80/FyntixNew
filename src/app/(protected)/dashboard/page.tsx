"use client";

import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { Banner } from "@/features/dashboard/components/Banner";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { GlobalInfrastructure } from "@/features/dashboard/components/GlobalInfrastructure";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";

export default function DashboardPage() {
  return (
    <>
      <Banner />
      <SummaryCards />
      <QuickActions />
      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
        <GlobalInfrastructure />
        <RecentActivity />
      </div>
    </>
  );
}
