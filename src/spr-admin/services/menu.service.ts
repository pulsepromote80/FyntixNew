import { apiClient } from "@/spr-admin/lib/api-client";

export interface MenuItem {
  id?: string;
  label: string;
  href: string;
  icon: string;
  children?: MenuItem[];
}

function addAdminPrefix(item: MenuItem): MenuItem {
  const href =
    item.href.startsWith("/spr-admin") ||
    item.href.startsWith("http://") ||
    item.href.startsWith("https://") ||
    item.href.startsWith("#")
      ? item.href
      : `/spr-admin${item.href.startsWith("/") ? item.href : `/${item.href}`}`;

  return {
    ...item,
    href,
    ...(item.children ? { children: item.children.map(addAdminPrefix) } : {}),
  };
}

/**
 * Menu service for fetching navigation items from the backend
 */
export const menuService = {
  getMenu: async () => {
    const items = await apiClient.get<MenuItem[]>("/menu");
    return items.map(addAdminPrefix);
  },
};
