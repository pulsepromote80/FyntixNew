import { apiClient } from "@/spr-admin/lib/api-client";
import type { PermissionMenu } from "@/spr-admin/features/menu-permission/types";

export interface AddMenuPermissionPayload {
  SubmenuId: string[];
  UserName: string;
}

export interface DeleteMenuPermissionPayload {
  SubmenuId: string[];
  UserName: string;
}

export interface AddMenuPermissionResponse {
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export const menuPermissionService = {
  getNames: () => apiClient.get<string[]>("/menu-permission/names"),
  getMenus: (username: string) =>
    apiClient.get<PermissionMenu[]>(
      `/menu-permission/menu?username=${encodeURIComponent(username)}`,
    ),
  addPermission: (payload: AddMenuPermissionPayload) =>
    apiClient.post<AddMenuPermissionResponse, AddMenuPermissionPayload>(
      "/menu-permission/add",
      payload,
    ),
  deletePermission: (payload: DeleteMenuPermissionPayload) =>
    apiClient.post<AddMenuPermissionResponse, DeleteMenuPermissionPayload>(
      "/menu-permission/delete",
      payload,
    ),
};
