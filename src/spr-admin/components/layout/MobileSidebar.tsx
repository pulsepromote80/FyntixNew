"use client";

import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useMenu } from "@/spr-admin/features/menu/hooks/useMenu";
import { useSidebarStore } from "@/spr-admin/store/sidebar.store";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/spr-admin/lib/utils";
import type { MenuItem } from "@/spr-admin/services/menu.service";
import { Spinner } from "@/spr-admin/components/ui/Spinner";

function isPathActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function containsActiveRoute(items: MenuItem[], pathname: string): boolean {
  return items.some(
    (item) =>
      (item.href && isPathActive(pathname, item.href)) ||
      (item.children?.length && containsActiveRoute(item.children, pathname)),
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);
  const { data: menuItems, isLoading, error } = useMenu();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fallback to empty array while loading or on error
  // Ensure menuItems is an array before using it
  const navItems = Array.isArray(menuItems) ? menuItems : [];

  // Filter out items without href to prevent Link errors
  const validNavItems = navItems.filter((item) => item.href && typeof item.href === 'string');

  useEffect(() => {
    const activeParents = new Set<string>();
    const addActiveParents = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (!item.children?.length) return;

        if (containsActiveRoute(item.children, pathname)) {
          const itemId = item.id || item.href;
          if (itemId) activeParents.add(itemId);
          addActiveParents(item.children);
        }
      });
    };

    addActiveParents(Array.isArray(menuItems) ? menuItems : []);
    setExpandedItems((previous) => new Set([...previous, ...activeParents]));
  }, [pathname, menuItems]);

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
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = itemId ? expandedItems.has(itemId) : false;
    const isActive = Boolean(item.href && isPathActive(pathname, item.href));
    const hasActiveChild = Boolean(
      item.children?.length && containsActiveRoute(item.children, pathname),
    );
    const activeStyle =
      "bg-gradient-to-r from-sidebar-active to-[#25c6e8] text-sidebar-active-foreground shadow-lg shadow-blue-500/20";

    return (
      <div key={item.id || item.href || `menu-item-${level}`}>
        {hasChildren ? (
          <div
            className={cn(
              "admin-nav-item flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive || hasActiveChild
                ? `admin-nav-item-active ${activeStyle}`
                : "text-sidebar-foreground",
            )}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
            onClick={() => toggleExpanded(itemId)}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
            <span className="flex-1">{item.label}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        ) : (
          <Link
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "admin-nav-item flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? `admin-nav-item-active ${activeStyle}`
                : "text-sidebar-foreground",
            )}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
            <span>{item.label}</span>
          </Link>
        )}

        {hasChildren && isExpanded && item.children && (
          <div className="flex flex-col">
            {item.children.map((child: MenuItem) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isMobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="w-80 bg-sidebar-bg p-4">
        {/* ============ LOGO SECTION  ============ */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Image
              src="/logos/fyntix-logo-dark.png"
              alt="Fyntix"
              width={160}
              height={64}
              className="admin-sidebar-logo-dark h-auto w-36 object-contain"
            />
            <Image
              src="/logos/fyntix-logo-light.png"
              alt="Fyntix"
              width={160}
              height={64}
              className="admin-sidebar-logo-light hidden h-auto w-36 object-contain"
            />
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-2 hover:bg-sidebar-muted text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* ============ LOGO SECTION END ============ */}

        <nav className="flex flex-col gap-1">
          {isLoading ? (
            <div
              className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-muted-foreground"
              role="status"
              aria-label="Loading menu"
            >
              <Spinner className="h-4 w-4 text-sidebar-muted-foreground" />
              <span>Loading menu...</span>
            </div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-destructive">Failed to load menu</div>
          ) : (
            validNavItems.map((item) => renderMenuItem(item))
          )}
        </nav>
      </div>
      <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
    </div>
  );
}