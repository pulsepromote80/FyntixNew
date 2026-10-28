import type { NavItem } from "@/spr-admin/types/common";
import { APP_ROUTES } from "@/spr-admin/lib/constants";

/**
 * Fallback navigation items used when dynamic menu API fails.
 * Primary navigation is now fetched from /api/Menu/getAllMenu based on adminUserId.
 */
export const fallbackNav: NavItem[] = [
  { label: "Dashboard", href: APP_ROUTES.dashboard, icon: "LayoutDashboard" },
  { label: "Users", href: APP_ROUTES.users, icon: "Users" },
  { label: "Transactions", href: APP_ROUTES.transactions, icon: "Receipt" },
  { label: "Settings", href: APP_ROUTES.settings, icon: "Settings" },
];

/**
 * Deprecated: Primary navigation is now dynamic from backend API.
 * Use fallbackNav for fallback scenarios.
 */
export const primaryNav = fallbackNav;
