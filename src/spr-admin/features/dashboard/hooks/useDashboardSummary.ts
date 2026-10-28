import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/spr-admin/features/dashboard/services/dashboard.service";
import { QUERY_KEYS } from "@/spr-admin/lib/constants";

export function useDashboardSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.summary,
    queryFn: dashboardService.getSummary,
    staleTime: 30 * 1000, // 30 seconds - dashboard data refreshes faster
    gcTime: 2 * 60 * 1000, // 2 minutes - keep in cache
  });
}