"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

/**
 * Single composition root for all client-side providers.
 * Wrap the app once in src/app/layout.tsx with <Providers>.
 * Add new global providers (theme, toast, etc.) here, not in layout.tsx.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="kalkii-theme">
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
