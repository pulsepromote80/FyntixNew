import { useQuery } from "@tanstack/react-query";
import { menuPermissionService } from "@/spr-admin/features/menu-permission/services/menuPermission.service";

export function usePermissionNames() {
  return useQuery({
    queryKey: ["menu-permission", "names"],
    queryFn: menuPermissionService.getNames,
    staleTime: 60_000,
    retry: false,
  });
}
