"use client";

import { useIdleTimeout } from "@/spr-admin/hooks/useIdleTimeout";
import { useLogout } from "@/spr-admin/features/auth/hooks/useLogout";

export function IdleLogout() {
  const logout = useLogout();

  useIdleTimeout(() => {
    logout.mutate();
  }, 15 * 60_000); 

  return null;
}
