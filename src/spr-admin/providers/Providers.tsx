"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/spr-admin/providers/QueryProvider";
import { ToastViewport } from "@/spr-admin/components/ui/ToastViewport";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <ToastViewport />
    </QueryProvider>
  );
}
