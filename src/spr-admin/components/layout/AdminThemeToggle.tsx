"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "@/spr-admin/providers/AdminThemeProvider";

export function AdminThemeToggle() {
  const { theme, toggleTheme } = useAdminTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-foreground transition-colors hover:border-[#1680ff] hover:text-[#1680ff] sm:h-10 sm:w-10"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
      ) : (
        <Moon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
      )}
    </button>
  );
}
