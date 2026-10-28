export interface PermissionMenu {
  id: string;
  name: string;
  subMenus: PermissionSubMenu[];
}

export interface PermissionSubMenu {
  id: string;
  permissionId?: string;
  name: string;
  permission: string | null;
}
