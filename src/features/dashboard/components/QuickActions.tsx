"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const logout = useLogout();
  const router = useRouter();

  const actions = [
    { label: "Add Funds", icon: "➕", href: "/fund-director" },
    { label: "Analytics", icon: "📊", href: "/analytics" },
    { label: "Affiliate", icon: "↗️", href: "/ai-business-hub" },
    { label: "Profile", icon: "👤", href: "/profile" },
    { label: "Support", icon: "🎧", href: "/support" },
    { label: "Withdrawal", icon: "💳", href: "/fund-director?tab=withdrawal" },
    { label: "Incomes", icon: "💰", href: "/fund-director?tab=income" },
    { label: "Wallets", icon: "👛", href: "/reports" },
    { label: "Transactions", icon: "📋", href: "/transactions" },
    { label: "Settings", icon: "⚙️", href: "/settings" },
    { label: "History", icon: "📜", href: "/order-history" },
    { label: "Reports", icon: "📈", href: "/reports" },
    { label: "Referrals", icon: "👥", href: "/direct-partners" },
    { label: "Notifications", icon: "🔔" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-700 dark:hover:text-amber-300"
              onClick={() => {
                if (action.label === "Logout") {
                  logout.mutate();
                } else if (action.label === "Notifications") {
                  window.dispatchEvent(new Event("open-header-notifications"));
                } else if (action.href) {
                  window.scrollTo({ top: 0, behavior: "instant" });
                  router.push(action.href);
                }
              }}
            >
              <span className="text-xl sm:text-2xl">{action.icon}</span>
              <span className="text-[10px] sm:text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
