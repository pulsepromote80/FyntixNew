import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  menuPermissionService,
  type DeleteMenuPermissionPayload,
} from "@/spr-admin/features/menu-permission/services/menuPermission.service";
import { useToastStore } from "@/spr-admin/store/toast.store";

export function useDeleteMenuPermission() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (payload: DeleteMenuPermissionPayload) =>
      menuPermissionService.deletePermission(payload),
    onSuccess: (response, payload) => {
      const queryKey = ["menu-permission", "menus", payload.UserName];
      const message =
        typeof response?.message === "string" && response.message.trim()
          ? response.message
          : "Menu permission deleted successfully";

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
          : "Failed to delete menu permission",
        "error",
      );
    },
  });
}
