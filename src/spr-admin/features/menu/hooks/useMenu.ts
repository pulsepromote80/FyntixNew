import { useQuery } from "@tanstack/react-query";
import { menuService } from "@/spr-admin/services/menu.service";
import { QUERY_KEYS } from "@/spr-admin/lib/constants";

export function useMenu() {
  return useQuery({
    queryKey: QUERY_KEYS.menu,
    queryFn: menuService.getMenu,
    staleTime: 60 * 1000, // 1 minute - data stays fresh for 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache longer
  });
}
