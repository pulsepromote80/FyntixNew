"use client";

import { useEffect } from "react";
import { useToastStore } from "@/spr-admin/store/toast.store";
import { cn } from "@/spr-admin/lib/utils";

function ToastItem({
  id,
  message,
  type,
}: {
  id: number;
  message: string;
  type: "success" | "error";
}) {
  const dismissToast = useToastStore((state) => state.dismissToast);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => dismissToast(id), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [dismissToast, id]);

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm font-medium shadow-lg",
        type === "success"
          ? "border-green-200 bg-white text-green-800"
          : "border-red-200 bg-white text-red-800",
      )}
    >
      {message}
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
