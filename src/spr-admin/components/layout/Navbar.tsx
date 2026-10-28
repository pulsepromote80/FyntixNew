"use client";

import { Menu, Bell, ChevronDown } from "lucide-react";
import { useSidebarStore } from "@/spr-admin/store/sidebar.store";
import { useAuthStore } from "@/spr-admin/store/auth.store";
import { Dropdown } from "@/spr-admin/components/ui/Dropdown";
import { useLogout } from "@/spr-admin/features/auth/hooks/useLogout";
import { useDashboardSummary } from "@/spr-admin/features/dashboard/hooks/useDashboardSummary";
import { AdminThemeToggle } from "@/spr-admin/components/layout/AdminThemeToggle";

export function Navbar() {
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);
  const user = useAuthStore((state) => state.user);
  const { data: dashboard } = useDashboardSummary();
  const { mutate: logout } = useLogout();
  const displayName = dashboard?.Name || dashboard?.FullName || user?.name || "";
  const displayPermission = dashboard?.Permission || user?.roles?.[0] || "";

  const getInitials = (name?: string) => {
    if (!name) return "SU";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-white px-4 md:px-6">

      {/* Left Section: Hamburger Menu (Mobile only) */}
      <div className="flex items-center">
        <button
          className="rounded-md p-2 hover:bg-muted lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right Section: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        <AdminThemeToggle />

        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100 sm:h-10 sm:w-10">
          <Bell className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
          {/* Notification Badge */}
          <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-medium text-white ring-2 ring-white sm:h-4 sm:w-4 sm:text-[10px]">
            0
          </span>
        </button>

        {/* User Dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-full bg-gray-50 p-1 transition-colors hover:bg-gray-100 sm:gap-3 sm:pr-3">

              {/* Avatar with Initials */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1680ff] text-xs font-semibold text-white sm:h-8 sm:w-8 sm:text-sm">
                {getInitials(displayName)}
              </div>

              {/* User Info */}
              <div className="flex min-w-0 max-w-[112px] flex-col items-start sm:max-w-none">
                <span className="max-w-full truncate text-xs font-medium leading-tight text-gray-900 sm:text-sm">
                  {displayName}
                </span>
                <span className="max-w-full truncate text-[10px] leading-tight text-gray-500 sm:text-[11px]">
                  {displayPermission}
                </span>
              </div>

              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
            </button>
          }
          items={[
            { label: "Profile", onSelect: () => { } },
            { label: "Settings", onSelect: () => { } },
            { label: "Sign out", onSelect: () => logout(), destructive: true },
          ]}
        />
      </div>
    </header>
  );
}