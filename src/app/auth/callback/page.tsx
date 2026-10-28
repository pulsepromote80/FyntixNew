"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface CallbackUserData {
  id?: string | number;
  userId?: string | number;
  name?: string;
  Fname?: string;
  email?: string;
  Email?: string;
  roles?: string[];
}

function isCallbackUserData(value: unknown): value is CallbackUserData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("token");
    const refreshToken = params.get("refresh");
    const userJson = params.get("user");

    window.history.replaceState({}, "", "/auth/callback");

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    let userData: CallbackUserData | null = null;
    if (userJson) {
      try {
        const parsedUserData: unknown = JSON.parse(decodeURIComponent(userJson));
        if (isCallbackUserData(parsedUserData)) userData = parsedUserData;
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }

    fetch("/api/auth/admin-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken,
        refreshToken,
        userData,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.success) throw new Error(data?.message);

        if (data.data) {
          setUser({
            id: String(data.data.id ?? data.data.userId ?? ""),
            name: data.data.name ?? data.data.Fname ?? "",
            email: data.data.email ?? data.data.Email ?? "",
            roles: data.data.roles ?? ["User"],
          });
        }

        window.history.replaceState({}, "", "/dashboard");
        router.replace("/dashboard");
      })
      .catch((err) => {
        console.error("Callback error:", err);
        router.replace("/login");
      });
  }, [router, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        <p className="text-sm tracking-wide">Loading....</p>
      </div>
    </div>
  );
}