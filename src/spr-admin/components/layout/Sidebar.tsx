"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { useMenu } from "@/spr-admin/features/menu/hooks/useMenu";
import { useSidebarStore } from "@/spr-admin/store/sidebar.store";
import { cn } from "@/spr-admin/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { MenuItem } from "@/spr-admin/services/menu.service";
import Image from "next/image";
import { Spinner } from "@/spr-admin/components/ui/Spinner";

export function Sidebar() {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const { data: menuItems, isLoading, error } = useMenu();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fallback to empty array while loading or on error
  // Ensure menuItems is an array before using it
  const navItems = Array.isArray(menuItems) ? menuItems : [];

  // Filter out items without href to prevent Link errors
  const validNavItems = navItems.filter((item) => item.href && typeof item.href === "string");

  const toggleExpanded = (itemId: string | undefined) => {
    if (!itemId) return;
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const itemId = item.id || item.href;
    const Icon = item.icon ? (Icons[item.icon as keyof typeof Icons] as Icons.LucideIcon) : null;
    const isActive = pathname.startsWith(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = itemId ? expandedItems.has(itemId) : false;

    return (
      <div key={item.id || item.href || `menu-item-${level}`}>
        {hasChildren ? (
          <div
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "admin-nav-item admin-nav-item-active bg-gradient-to-r from-sidebar-active to-[#25c6e8] text-sidebar-active-foreground shadow-lg shadow-blue-500/20"
                : "admin-nav-item text-sidebar-foreground",
            )}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
            onClick={() => toggleExpanded(itemId)}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {hasChildren &&
                  (isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ))}
              </>
            )}
          </div>
        ) : (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "admin-nav-item admin-nav-item-active bg-gradient-to-r from-sidebar-active to-[#25c6e8] text-sidebar-active-foreground shadow-lg shadow-blue-500/20"
                : "admin-nav-item text-sidebar-foreground",
            )}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        )}

        {hasChildren && isExpanded && !isCollapsed && item.children && (
          <div className="flex flex-col">
            {item.children.map((child: MenuItem) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-sidebar-border bg-gradient-to-b from-sidebar-bg to-[#0f111a] lg:block",
        isCollapsed ? "w-16" : "w-68",
      )}
    >
      {/* --- YAHAN SE LOGO SECTION START HAI --- */}
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border/50 px-5 py-6",
          isCollapsed ? "justify-center px-0" : "",
        )}
      >
        <div className="flex items-center justify-center">
          <Image
            src="/logos/fyntix-logo-dark.png"
            alt="Fyntix"
            width={160}
            height={64}
            className={cn(
              "admin-sidebar-logo-dark shrink-0 object-contain transition-all duration-200",
              isCollapsed ? "h-10 w-10" : "h-auto w-36 sm:w-40",
            )}
            priority
          />
          <Image
            src="/logos/fyntix-logo-light.png"
            alt="Fyntix"
            width={160}
            height={64}
            className={cn(
              "admin-sidebar-logo-light hidden shrink-0 object-contain transition-all duration-200",
              isCollapsed ? "h-10 w-10" : "h-auto w-36 sm:w-40",
            )}
            priority
          />
        </div>
      </div>
      {/* --- LOGO SECTION END --- */}

      <nav className="flex flex-col gap-1 whitespace-nowrap p-3">
        {isLoading ? (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm text-sidebar-muted-foreground",
              isCollapsed && "justify-center px-0",
            )}
            role="status"
            aria-label="Loading menu"
          >
            <Spinner className="h-4 w-4 text-sidebar-muted-foreground" />
            {!isCollapsed && <span>Loading menu...</span>}
          </div>
        ) : error ? (
          <div className="px-3 py-2 text-sm text-destructive">Failed to load menu</div>
        ) : (
          validNavItems.map((item) => renderMenuItem(item))
        )}
      </nav>
    </aside>
  );
}
