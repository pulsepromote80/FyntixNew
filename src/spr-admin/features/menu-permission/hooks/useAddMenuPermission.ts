import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  menuPermissionService,
  type AddMenuPermissionPayload,
} from "@/spr-admin/features/menu-permission/services/menuPermission.service";
import type { PermissionMenu } from "@/spr-admin/features/menu-permission/types";
import { useToastStore } from "@/spr-admin/store/toast.store";

export function useAddMenuPermission() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (payload: AddMenuPermissionPayload) => menuPermissionService.addPermission(payload),
    onSuccess: (response, payload) => {
      const succeededIds = new Set(payload.SubmenuId);
      const username = payload.UserName;
      const queryKey = ["menu-permission", "menus", username];

      if (username) {
        queryClient.setQueryData<PermissionMenu[]>(queryKey, (menus) =>
          menus?.map((menu) => ({
            ...menu,
            subMenus: menu.subMenus.map((subMenu) =>
              subMenu.permissionId && succeededIds.has(subMenu.permissionId)
                ? { ...subMenu, permission: "Access" }
                : subMenu,
            ),
          })),
        );
      }

      const succeededCount = succeededIds.size;
      const message =
        typeof response?.message === "string" && response.message.trim()
          ? response.message
          : `Permission assigned successfully to ${succeededCount} submenus`;

      showToast(message);
      return queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      const responseMessage = axios.isAxiosError<{ message?: unknown }>(error)
        ? error.response?.data?.message
        : undefined;
      showToast(
        typeof responseMessage === "string" && responseMessage.trim()
          ? responseMessage
          : "Failed to update menu permission",
        "error",
      );
    },
  });
}
