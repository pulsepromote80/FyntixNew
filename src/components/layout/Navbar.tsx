"use client";

import { Menu, User, Moon, Sun, Wallet, Bell, ChevronDown, UserRound, ChevronUp, Check, Copy, Headphones, LogOut, X, Briefcase, TrendingUp, BarChart3, ShieldCheck, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { primaryNav } from "@/config/navigation";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useTheme } from "next-themes";
import Image from "next/image";
import type { NavItem } from "@/types/common";

type HeaderNotification = Record<string, unknown>;

function isNavPathActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function isNavItemActive(pathname: string, item: NavItem) {
  return item.isDropdown && item.dropdownItems
    ? item.dropdownItems.some((dropdownItem) => isNavPathActive(pathname, dropdownItem.href))
    : isNavPathActive(pathname, item.href);
}

function getNotificationRows(payload: unknown): HeaderNotification[] {
  const pending: unknown[] = [payload];
  const visited = new Set<object>();
  let depth = 0;

  while (pending.length && depth < 6) {
    const currentLevel = pending.splice(0);
    for (const value of currentLevel) {
      if (Array.isArray(value)) {
        if (
          value.every(
            (item) => typeof item === "object" && item !== null && !Array.isArray(item),
          )
        ) {
          return value.filter(
            (item): item is HeaderNotification =>
              typeof item === "object" && item !== null && !Array.isArray(item),
          );
        }
        pending.push(...value);
        continue;
      }
      if (typeof value !== "object" || value === null || visited.has(value)) continue;
      visited.add(value);

      const record = value as Record<string, unknown>;
      for (const key of ["unSeenNotificationList", "notificationList"]) {
        const rows = record[key];
        if (Array.isArray(rows)) {
          return rows.filter(
            (item): item is HeaderNotification =>
              typeof item === "object" && item !== null && !Array.isArray(item),
          );
        }
      }
      pending.push(...Object.values(record));
    }
    depth += 1;
  }

  if (typeof payload === "object" && payload !== null && "success" in payload && payload.success === false) {
    throw new Error(
      "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "Could not load notifications.",
    );
  }
  return [];
}

function getNotificationId(notification: HeaderNotification, index: number) {
  const id =
    notification.NotificationId ??
    notification.notificationId ??
    notification.URID ??
    notification.id;
  return String(id ?? `notification-${index}`);
}

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loadingInvestmentFund, setLoadingInvestmentFund] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [seenNotifications, setSeenNotifications] = useState<Set<string>>(new Set());
  const [seenNotificationsUser, setSeenNotificationsUser] = useState<string | null>(null);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);
  const [authLoginCopied, setAuthLoginCopied] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const logout = useLogout();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLoadingInvestmentFund(false);
    setMobileDropdownOpen(null);
  }, [pathname]);

  const { data: dashboardData } = useDashboardSummary();
  const displayAuthLogin = dashboardData?.data?.[0]?.AuthLogin || user?.name || 'Account';
  const walletData = dashboardData?.data?.[0];
  const notificationUserKey = user?.id || displayAuthLogin;

  const loadNotifications = useCallback(async () => {
    setNotificationsError("");
    try {
      const response = await fetch("/api/notifications");

      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof payload === "object" &&
            payload !== null &&
            "message" in payload &&
            typeof payload.message === "string"
            ? payload.message
            : "Could not load notifications.",
        );
      }
      setNotifications(getNotificationRows(payload));
    } catch (error) {
      console.error("Could not load header notifications:", error);
      setNotificationsError(
        error instanceof Error ? error.message : "Could not load notifications.",
      );
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    logout.mutate();
  };

  const copyAuthLogin = () => {
    if (displayAuthLogin) {
      navigator.clipboard.writeText(displayAuthLogin);
      setAuthLoginCopied(true);
      setTimeout(() => setAuthLoginCopied(false), 2000);
    }
  };

  // Click Outside Logic (Account Menu + Wallet Menu)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
        setWalletOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (accountMenuOpen || walletOpen || notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen, walletOpen, notificationsOpen]);

  useEffect(() => {
    const openNotifications = () => {
      setAccountMenuOpen(false);
      setWalletOpen(false);
      setNotificationsOpen(true);
    };

    window.addEventListener("open-header-notifications", openNotifications);
    return () => window.removeEventListener("open-header-notifications", openNotifications);
  }, []);

  useEffect(() => {
    if (!notificationUserKey || notificationUserKey === "Account") return;
    try {
      const savedSeenNotifications = localStorage.getItem(
        `kaliki-seen-notifications:${notificationUserKey}`,
      );
      const parsed: unknown = savedSeenNotifications ? JSON.parse(savedSeenNotifications) : [];
      setSeenNotifications(
        new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []),
      );
    } catch (error) {
      console.error("Could not restore read notification state:", error);
      setSeenNotifications(new Set());
    }
    setSeenNotificationsUser(notificationUserKey);
  }, [notificationUserKey]);

  useEffect(() => {
    if (seenNotificationsUser !== notificationUserKey || notificationUserKey === "Account") return;
    localStorage.setItem(
      `kaliki-seen-notifications:${notificationUserKey}`,
      JSON.stringify([...seenNotifications]),
    );
  }, [notificationUserKey, seenNotifications, seenNotificationsUser]);

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 30_000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  const unreadCount = notifications.reduce((count, notification, index) => {
    const id = getNotificationId(notification, index);
    const isSeen = notification.Seen ?? notification.seen;
    return count + (!isSeen && !seenNotifications.has(id) ? 1 : 0);
  }, 0);

  const markNotificationsRead = async () => {
    try {
      const response = await fetch("/api/notifications", { method: "POST" });
      const payload: unknown = await response.json();
      if (
        !response.ok ||
        (typeof payload === "object" &&
          payload !== null &&
          "success" in payload &&
          payload.success === false)
      ) {
        throw new Error(
          typeof payload === "object" &&
            payload !== null &&
            "message" in payload &&
            typeof payload.message === "string"
            ? payload.message
            : "Could not mark notifications as read.",
        );
      }
      setSeenNotifications(
        new Set(notifications.map((notification, index) => getNotificationId(notification, index))),
      );
      await loadNotifications();
      setNotificationsOpen(false);
    } catch (error) {
      console.error("Could not mark notifications as read:", error);
      setNotificationsError(
        error instanceof Error ? error.message : "Could not mark notifications as read.",
      );
    }
  };

  const markNotificationSeen = (notification: HeaderNotification, index: number) => {
    const id = getNotificationId(notification, index);
    setSeenNotifications((current) => new Set(current).add(id));
  };

  // Wallet Data (Screenshot ke hisaab se)
  const wallets = [
    {
      id: 'deposit',
      name: 'Deposit Wallet',
      balance: walletData?.DepositWallet ? `$${Number(walletData.DepositWallet).toFixed(4)}` : '$0.0000',
      icon: Briefcase,
      color: '#0ea5e9',
      bg: '#e0f2fe'
    },
    {
      id: 'performance',
      name: 'Working Wallet',
      balance: walletData?.WorkingWallet ? `$${Number(walletData.WorkingWallet).toFixed(4)}` : '$0.0000',
      icon: TrendingUp,
      color: '#8b5cf6',
      bg: '#ede9fe'
    },
    {
      id: 'yield',
      name: 'ROI Wallet',
      balance: walletData?.ROIWallet ? `$${Number(walletData.ROIWallet).toFixed(4)}` : '$0.0000',
      icon: BarChart3,
      color: '#10b981',
      bg: '#d1fae5'
    },
   
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 sm:px-6 bg-white dark:bg-[#0B1021] border-gray-200 dark:border-[#1E293B]">
      <button
        className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-white/5 lg:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open menu"
        style={{ color: '#f5c451' }}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-4 sm:gap-8 flex-1">
        <div className="flex items-center gap-2">
          <Image
            src="/logos/kalki-horizontal-logo.png"
            alt="KALKII Logo"
            width={150}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </div>

        <nav className="hidden lg:flex items-center gap-6 sm:gap-10 flex-1 justify-center">
          {primaryNav.map((item) => {
            const isActive = isNavItemActive(pathname, item);

            if (item.isDropdown && item.dropdownItems) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors",
                      isActive ? "" : "hover:text-[#f5c451]",
                    )}
                    style={{ color: isActive ? '#f5c451' : (!mounted || theme === 'dark') ? '#E2E8F0' : '#334155' }}
                    aria-expanded={openDropdown === item.label}
                  >
                    {item.img && (
                      <img
                        src={item.img}
                        alt={item.label}
                        className="h-5 w-5"
                      />
                    )}
                    {item.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {openDropdown === item.label && (
                    <div className="absolute left-0 top-full z-50 w-56 pt-2">
                      <div className="rounded-md border shadow-lg bg-white dark:bg-[#0B1021] border-gray-200 dark:border-[#1E293B]">
                        <div className="py-2">
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.href}
                              href={dropdownItem.href}
                              onClick={(event) => {
                                setOpenDropdown(null);
                                if (dropdownItem.href === "/investment-amount" && pathname !== dropdownItem.href) {
                                  event.preventDefault();
                                  setLoadingInvestmentFund(true);
                                  router.push(dropdownItem.href);
                                }
                              }}
                              className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5"
                              style={{ color: pathname === dropdownItem.href ? '#f5c451' : ((!mounted || theme === 'dark') ? '#E2E8F0' : '#334155') }}
                            >
                              {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isActive ? "" : "hover:text-[#f5c451]",
                )}
                style={{ color: isActive ? '#f5c451' : (!mounted || theme === 'dark') ? '#E2E8F0' : '#334155' }}
              >
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.label}
                    className="h-5 w-5"
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-white/5"
          aria-label="Toggle theme"
          style={{ color: '#f5c451' }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && theme === 'dark' ? <Sun className="h-4 sm:h-5 w-4 sm:w-5" /> : <Moon className="h-4 sm:h-5 w-4 sm:w-5" />}
        </button>

        {/* ================= WALLET DROPDOWN START ================= */}
        <div ref={walletRef} className="relative hidden sm:block">
          <button
            onClick={() => setWalletOpen((open) => !open)}
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Wallet"
            style={{ color: '#f5c451' }}
          >
            <Wallet className="h-5 w-5" />
          </button>

          {walletOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[320px] rounded-2xl border shadow-2xl bg-white dark:bg-[#0B1021] border-gray-200 dark:border-[#1E293B] dark:shadow-black/50 overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#1E293B]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Wallet Balance</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your current balances</p>
                  </div>
                </div>
                <button
                  onClick={() => setWalletOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Wallet List */}
              <div className="p-4 space-y-3">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors hover:opacity-90"
                    style={{ backgroundColor: wallet.bg }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Colored Dot */}
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: wallet.color }} />

                      {/* Icon & Name */}
                      <wallet.icon size={18} style={{ color: wallet.color }} />
                      <span className="text-sm font-semibold" style={{ color: wallet.color }}>
                        {wallet.name}
                      </span>
                    </div>

                    {/* Balance */}
                    <span className="text-sm font-bold" style={{ color: wallet.color }}>
                      {wallet.balance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* ================= WALLET DROPDOWN END ================= */}

        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative rounded-md p-2 hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={notificationsOpen}
            style={{ color: "#f5c451" }}
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {unreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-[#0B1021]"
                aria-hidden="true"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[min(340px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-[#1E293B] dark:bg-[#0B1021] dark:shadow-black/50">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 dark:border-[#1E293B]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                    <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
                      Notifications
                    </p>
                    {unreadCount > 0 && (
                      <p className="text-[11px] leading-tight text-blue-500 dark:text-blue-400">
                        {unreadCount} unread
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void markNotificationsRead()}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  aria-label="Mark notifications as read and close"
                  title="Mark all as read"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className={`overflow-y-auto ${notifications.length > 3 ? "max-h-72" : "max-h-56"}`}>
                {notificationsError ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-rose-600 dark:text-rose-300">{notificationsError}</p>
                    <button
                      type="button"
                      onClick={() => void loadNotifications()}
                      className="mt-2 text-xs font-semibold text-blue-600 underline dark:text-blue-400"
                    >
                      Retry
                    </button>
                  </div>
                ) : notificationsLoading ? (
                  <div className="flex justify-center px-4 py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#F5C451]" aria-label="Loading notifications" />
                  </div>
                ) : unreadCount > 0 ? (
                  notifications.map((notification, index) => {
                    const id = getNotificationId(notification, index);
                    const isSeen = notification.Seen ?? notification.seen;
                    const isUnread =
                      !isSeen && !seenNotifications.has(id);
                    const message =
                      (typeof notification.AdminRemarks === "string" &&
                        notification.AdminRemarks) ||
                      (typeof notification.adminRemarks === "string" &&
                        notification.adminRemarks) ||
                      (typeof notification.message === "string" && notification.message) ||
                      "You have a new notification.";
                    const rawDate = notification.NotificationDate ?? notification.notificationDate;
                    const parsedDate =
                      typeof rawDate === "string" || typeof rawDate === "number"
                        ? new Date(rawDate)
                        : null;

                    const amount = notification.Amount ?? notification.amount;
                    const amountText =
                      typeof amount === "string" || typeof amount === "number"
                        ? String(amount)
                        : "";

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => markNotificationSeen(notification, index)}
                        className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3.5 text-left transition-colors last:border-0 dark:border-gray-700/30 ${isUnread
                          ? "bg-blue-50/60 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                          <Bell className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] leading-relaxed text-gray-700 dark:text-gray-300">
                            {message}
                          </span>
                          {amountText && (
                            <span className="mt-1 block text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              {amountText}
                            </span>
                          )}

                        </span>
                        {isUnread && (
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800">
                      <Bell className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        All caught up!
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        No new notifications
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          ref={accountMenuRef}
          className="relative"
          onMouseEnter={() => setAccountMenuOpen(true)}
          onMouseLeave={() => setAccountMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => setAccountMenuOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full border px-2 py-1.5 text-xs transition hover:border-[#f5c451] hover:bg-gray-100 dark:hover:bg-white/5 sm:px-2.5 bg-white dark:bg-[#0B1021] border-gray-200 dark:border-[#1E293B]"
            style={{ color: '#f5c451' }}
            aria-expanded={accountMenuOpen}
            aria-label="Open account menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(145deg, #f5c451, #d4a017)', color: '#0B1021' }}>
              <UserRound size={17} strokeWidth={2} />
            </span>
            <span className="hidden sm:block max-w-[96px] truncate font-semibold ">{displayAuthLogin || 'Account'}</span>
            {accountMenuOpen ? <ChevronUp size={15} strokeWidth={2} /> : <ChevronDown size={15} strokeWidth={2} />}
          </button>

          {accountMenuOpen && (
            <div className="absolute right-0 top-full z-20 w-[min(280px,calc(100vw-1.5rem))] pt-3">
              <div className="overflow-hidden rounded-2xl border shadow-2xl bg-white dark:bg-[#0B1021] border-gray-200 dark:border-[#1E293B] dark:shadow-black/50">
                <div className="p-4 sm:p-5">
                  <div className="mb-3 text-[11px] font-semibold tracking-[0.18em]" style={{ color: theme === 'dark' ? '#64748B' : '#6B7280' }}>YOUR USER ID</div>
                  <button type="button" onClick={copyAuthLogin} className="flex w-full items-center justify-between gap-3 rounded-xl p-2 text-left transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#f5c451]" style={{ background: 'linear-gradient(135deg, #f5c451, #d4a017)', color: '#0B1021' }} aria-label="Copy your user ID">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide" style={{ background: 'rgba(255,255,255,0.22)' }}>ID</span>
                      <span className="truncate text-base font-semibold tracking-wide">{displayAuthLogin || 'Not available'}</span>
                    </span>
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.22)' }}>
                      {authLoginCopied ? <Check size={17} /> : <Copy size={17} />}
                    </span>
                  </button>
                  <div className="mt-2 text-center text-xs" style={{ color: theme === 'dark' ? '#64748B' : '#6B7280' }}>Click to copy your ID</div>
                </div>
                <div className="border-t py-1 border-gray-200 dark:border-[#1E293B]">
                <Link
                  href="/profile"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                  style={{ color: theme === 'dark' ? '#E2E8F0' : '#334155' }}
                >
                  <UserRound size={18} strokeWidth={1.8} />
                  Profile
                </Link>

                <Link
                  href="/support"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                  style={{ color: theme === 'dark' ? '#E2E8F0' : '#334155' }}
                >
                  <Headphones size={18} strokeWidth={1.8} />
                  Support
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm font-medium transition-colors hover:bg-red-500/10"
                  style={{ color: '#F87171' }}
                >
                  <LogOut size={18} strokeWidth={1.8} />
                  Logout
                </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#0B1021] shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#1E293B]">
              <span className="font-bold" style={{ color: '#f5c451' }}>Menu</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {primaryNav.map((item) => {
                const isActive = isNavItemActive(pathname, item);
                const isDropdownOpen = mobileDropdownOpen === item.label;

                if (item.isDropdown && item.dropdownItems) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => setMobileDropdownOpen(isDropdownOpen ? null : item.label)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive ? "bg-[#f5c451]/10 text-[#f5c451]" : "hover:bg-gray-100 dark:hover:bg-white/5"
                        )}
                        style={{ color: isActive ? '#f5c451' : (!mounted || theme === 'dark') ? '#E2E8F0' : '#334155' }}
                      >
                        <div className="flex items-center gap-3">
                          {item.img && (
                            <img
                              src={item.img}
                              alt={item.label}
                              className="h-5 w-5"
                            />
                          )}
                          {item.label}
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen ? "rotate-180" : "")} />
                      </button>
                      {isDropdownOpen && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.dropdownItems.map((dropdownItem) => {
                            const isDropdownItemActive = isNavPathActive(pathname, dropdownItem.href);

                            return (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                onClick={() => {
                                  setMobileNavOpen(false);
                                  setMobileDropdownOpen(null);
                                }}
                                aria-current={isDropdownItemActive ? "page" : undefined}
                                className={cn(
                                  "block px-4 py-2 text-sm rounded-lg transition-colors",
                                  isDropdownItemActive
                                    ? "bg-[#f5c451]/10 font-semibold"
                                    : "hover:bg-gray-100 dark:hover:bg-white/5",
                                )}
                                style={{
                                  color: isDropdownItemActive
                                    ? "#f5c451"
                                    : (!mounted || theme === "dark")
                                      ? "#E2E8F0"
                                      : "#334155",
                                }}
                              >
                                {dropdownItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-[#f5c451]/10 text-[#f5c451]" : "hover:bg-gray-100 dark:hover:bg-white/5"
                    )}
                    style={{ color: isActive ? '#f5c451' : (!mounted || theme === 'dark') ? '#E2E8F0' : '#334155' }}
                  >
                    {item.img && (
                      <img
                        src={item.img}
                        alt={item.label}
                        className="h-5 w-5"
                      />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      {loadingInvestmentFund && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/75 px-4 backdrop-blur-sm">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-amber-400/20 bg-[#0B1021] shadow-2xl shadow-amber-500/10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10">
              <Loader2 className="h-7 w-7 animate-spin text-[#F5C451]" aria-hidden />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}