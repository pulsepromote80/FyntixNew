import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { QUERY_KEYS } from "@/lib/constants";
import { useEffect } from "react";

export function useDashboardSummary() {
  const query = useQuery({
    queryKey: QUERY_KEYS.dashboard.summary,
    queryFn: dashboardService.getSummary,
  });

  useEffect(() => {
    if (query.data?.data?.[0]?.AuthLogin) {
      localStorage.setItem("authLogin", query.data.data[0].AuthLogin);
    }
  }, [query.data]);

  return query;
}
