import { useQuery } from "@tanstack/react-query";
import { menuPermissionService } from "@/spr-admin/features/menu-permission/services/menuPermission.service";

export function useMenuPermissions(username: string | null) {
  return useQuery({
    queryKey: ["menu-permission", "menus", username],
    queryFn: () => {
      if (!username) {
        throw new Error("Select an admin to load menu permissions");
      }
      return menuPermissionService.getMenus(username);
    },
    enabled: Boolean(username),
    retry: false,
  });
}
