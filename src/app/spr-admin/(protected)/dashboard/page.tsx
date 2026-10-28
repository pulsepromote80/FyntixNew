import { PageHeader } from "@/spr-admin/components/common/PageHeader";
import { SummaryCards } from "@/spr-admin/features/dashboard/components/SummaryCards";
import { NormalInvestmentOverview } from "@/spr-admin/features/dashboard/components/NormalInvestmentOverview";
import { PackageInvestmentOverview } from "@/spr-admin/features/dashboard/components/PackageInvestmentOverview";
import { PackageBreakdownTable } from "@/spr-admin/features/dashboard/components/PackageBreakdownTable";
import { IncomeOverview } from "@/spr-admin/features/dashboard/components/IncomeOverview";
import { BoosterOverview } from "@/spr-admin/features/dashboard/components/BoosterOverview";
import { WithdrawalOverview } from "@/spr-admin/features/dashboard/components/WithdrawalOverview";
import { RecentActivityTables } from "@/spr-admin/features/dashboard/components/RecentActivityTables";
import { BottomSummaryMetrics } from "@/spr-admin/features/dashboard/components/BottomSummaryMetrics";

export default function DashboardPage() {
  return (
    <div className="spr-admin-dashboard -m-2 min-h-full p-2 sm:-m-4 sm:p-4">
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title="Dashboard Overview"
          description="Welcome back, Super Admin! Here's what's happening with your platform today."
        />

        <div className="grid w-full grid-cols-1 gap-4 sm:gap-6">
          <SummaryCards />
          <NormalInvestmentOverview />
          <PackageInvestmentOverview />
          <PackageBreakdownTable />
          <IncomeOverview />
          <BoosterOverview />
          <WithdrawalOverview />
          <RecentActivityTables />
          <BottomSummaryMetrics />
        </div>
      </div>
    </div>
  );
}