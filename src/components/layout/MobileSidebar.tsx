"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { primaryNav } from "@/config/navigation";
import { useSidebarStore } from "@/store/sidebar.store";

export function MobileSidebar() {
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  if (!isMobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="w-64 bg-background p-4">
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="mb-4 rounded-md p-2 hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
        <nav className="flex flex-col gap-1">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
    </div>
  );
}
