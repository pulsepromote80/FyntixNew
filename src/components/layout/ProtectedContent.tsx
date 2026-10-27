"use client";

import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { mutate: logout } = useLogout();

  useIdleTimeout(() => {
    logout();
  }, 15 * 60_000);

  return <>{children}</>;
}
