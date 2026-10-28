"use client";

import {
  Search,
  X,
  FileSpreadsheet,
  Gift,
  Star,
  Banknote,
  ToggleLeft,
  UserX,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/spr-admin/components/layout/Breadcrumb";

// ---------- Types ----------
export type GiftType = "gift" | "special" | "gift3";

export interface GiftUser {
  id: number;
  name: string;
  email: string;
  userId: string;
  giftType: GiftType;
  giftxActive: boolean;
  totalInvestment: number;
  joinDate: string;
  remark: string;
}

// ---------- Static Data ----------
export const GIFT_STATS = {
  gift: 1227,
  special: 2458,
  gift3: 1,
  total: 3686,
};

export const GIFT_USERS: GiftUser[] = [
  { id: 1, name: "Setelment 5000", email: "monsagency6775@gmail.com", userId: "KAL461182", giftType: "gift", giftxActive: false, totalInvestment: 5000, joinDate: "15 Sep 2026", remark: "" },
  { id: 2, name: "RAKESH JOSHI", email: "rj240782@gmail.com", userId: "KAL386803", giftType: "gift", giftxActive: false, totalInvestment: 100, joinDate: "15 Sep 2026", remark: "" },
  { id: 3, name: "Naresh kumar Pandit", email: "1994nareshpandit@gmail.com", userId: "KAL150687", giftType: "gift", giftxActive: false, totalInvestment: 100, joinDate: "15 Sep 2026", remark: "" },
  { id: 4, name: "Amit Sharma", email: "amit.sharma@gmail.com", userId: "KAL220418", giftType: "special", giftxActive: true, totalInvestment: 2500, joinDate: "14 Sep 2026", remark: "Verified" },
  { id: 5, name: "Priya Verma", email: "priya.verma@gmail.com", userId: "KAL778201", giftType: "special", giftxActive: false, totalInvestment: 750, joinDate: "13 Sep 2026", remark: "" },
  { id: 6, name: "Rohit Mandal", email: "rohit.mandal@gmail.com", userId: "KAL990133", giftType: "gift3", giftxActive: false, totalInvestment: 300, joinDate: "12 Sep 2026", remark: "" },
];

// ---------- Config ----------
const GIFT_BADGE: Record<GiftType, { label: string; cls: string; icon: typeof Gift }> = {
  gift: { label: "Gift User", cls: "border-amber-300 bg-amber-100 text-amber-800", icon: Gift },
  special: { label: "Special Gift", cls: "border-purple-300 bg-purple-100 text-purple-800", icon: Star },
  gift3: { label: "Gift 3 User", cls: "border-blue-300 bg-blue-100 text-blue-800", icon: Banknote },
};

const STAT_ITEMS = [
  { label: "GIFT USERS", value: GIFT_STATS.gift, icon: Gift, chip: "bg-amber-100 text-amber-600" },
  { label: "SPECIAL GIFT USERS", value: GIFT_STATS.special, icon: Star, chip: "bg-purple-100 text-purple-600" },
  { label: "GIFT 3 USERS", value: GIFT_STATS.gift3, icon: Banknote, chip: "bg-blue-100 text-blue-600" },
  { label: "TOTAL USERS", value: GIFT_STATS.total, icon: Users, chip: "bg-green-100 text-green-600" },
];

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

// ---------- Page ----------
export function GiftUsersPage() {
  const rows = GIFT_USERS;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Gift Users" }]} />
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Gifts</h1>
        <p className="text-sm text-slate-500">Manage Gift, Special Gift &amp; Gift 3 users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_ITEMS.map(({ label, value, icon: Icon, chip }) => (
          <div key={label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${chip}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-slate-900">{value}</p>
              <p className="mt-1 text-xs font-medium tracking-wider text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="w-56">
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Gift Type</label>
          <select
            defaultValue="all"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500"
          >
            <option value="all">All Gift Users</option>
            <option value="gift">Gift User</option>
            <option value="special">Special Gift User</option>
            <option value="gift3">Gift 3 User (Withdrawal)</option>
          </select>
        </div>

        <div className="w-64">
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Search</label>
          <input
            placeholder="Name, Email, User id..."
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-amber-500"
          />
        </div>

        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#c9a227] px-5 text-sm font-semibold text-white hover:opacity-90">
          <Search className="h-4 w-4" /> Search
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <X className="h-4 w-4" /> Clear
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <FileSpreadsheet className="h-4 w-4 text-green-600" /> Export to CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">Gift Users</h3>
          <span className="text-sm text-slate-500">Total {rows.length} users found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                {["#", "User", "User ID", "Gift Status", "Giftx Status", "Total Investment", "Join Date", "Last Remark", "Action"].map((h) => (
                  <th key={h} className={`px-4 py-3 font-semibold ${h === "Action" ? "text-center" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((u, i) => {
                const b = GIFT_BADGE[u.giftType];
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-4 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded bg-amber-50 px-2 py-1 font-mono text-xs text-amber-800">{u.userId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${b.cls}`}>
                        <b.icon className="h-3.5 w-3.5" /> {b.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                          u.giftxActive
                            ? "border-green-300 bg-green-50 text-green-700"
                            : "border-slate-300 bg-slate-50 text-slate-600"
                        }`}
                      >
                        <ToggleLeft className="h-3.5 w-3.5" /> {u.giftxActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{money(u.totalInvestment)}</td>
                    <td className="px-4 py-4 text-slate-500">{u.joinDate}</td>
                    <td className="px-4 py-4 text-slate-400">{u.remark || "—"}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center gap-2">
                        <button className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100">
                          <ToggleLeft className="h-3.5 w-3.5" /> Giftx {u.giftxActive ? "Active" : "Inactive"}
                        </button>
                        <button className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100">
                          <UserX className="h-3.5 w-3.5" /> Reset to Normal
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}