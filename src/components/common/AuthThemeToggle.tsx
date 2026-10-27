"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function AuthThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="fixed right-4 top-4 z-50 inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:text-amber-300 dark:hover:bg-slate-800"
    >
      <Moon className="size-5 dark:hidden" />
      <Sun className="hidden size-5 dark:block" />
    </button>
  );
}
