"use client";

import { Ticket } from "lucide-react";
import { AdminTicketList } from "@/spr-admin/features/tickets/components/AdminTicketList";

export default function TicketLogs() {
  return (
    <div className="spr-admin-ticket-page flex w-full flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1680ff] shadow-sm">
          <Ticket className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Logs</h1>
          <p className="mt-0.5 text-sm text-gray-500">View closed and completed support tickets</p>
        </div>
      </div>

      <AdminTicketList status="closed" />
    </div>
  );
}
