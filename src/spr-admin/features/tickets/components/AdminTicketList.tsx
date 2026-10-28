"use client";

import { useMemo, useState } from "react";
import { Eye, Ticket } from "lucide-react";
import { Button } from "@/spr-admin/components/ui/Button";
import { EmptyState } from "@/spr-admin/components/ui/EmptyState";
import { ErrorState } from "@/spr-admin/components/ui/ErrorState";
import { SearchInput } from "@/spr-admin/components/common/SearchInput";
import { Spinner } from "@/spr-admin/components/ui/Spinner";
import { TicketDetailsDialog } from "@/spr-admin/features/tickets/components/TicketDetailsDialog";
import { useAdminTickets } from "@/spr-admin/features/tickets/hooks/useAdminTickets";
import {
  isClosedTicket,
  isOpenTicket,
  type TicketRecord,
  type TicketStatus,
} from "@/spr-admin/features/tickets/types";

interface AdminTicketListProps {
  status: TicketStatus;
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getErrorMessage(error: Error): string {
  return error.message || "Unable to load tickets. Please try again.";
}

export function AdminTicketList({ status }: AdminTicketListProps) {
  const { data: allTickets = [], isPending, error, refetch } = useAdminTickets(status);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const isOpen = status === "open";
  const title = isOpen ? "Open Tickets" : "Closed Tickets";
  const description = isOpen
    ? "View and respond to customer support requests"
    : "View history of resolved and closed tickets";

  const tickets = useMemo(() => {
    const visibleTickets = allTickets.filter(isOpen ? isOpenTicket : isClosedTicket);
    const term = search.trim().toLowerCase();
    if (!term) return visibleTickets;
    return visibleTickets.filter((ticket) =>
      [ticket.TicketId, ticket.UserID, ticket.UserName, ticket.Subject, ticket.TicketType]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [allTickets, isOpen, search]);

  const totalPages = Math.max(1, Math.ceil(tickets.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const currentTickets = tickets.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-[#1680ff] px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Ticket className="h-5 w-5" aria-hidden />
            {title}
          </h2>
          <p className="mt-1 text-xs text-blue-50">{description}</p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h3 className="text-xl font-bold text-gray-900">
              {isOpen ? "Tickets List" : "Closed Tickets List"}
            </h3>
            <div className="w-full md:w-80">
              <SearchInput
                aria-label="Search tickets"
                placeholder="Search by user, subject, or ticket ID..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="bg-white focus-visible:border-[#1680ff] focus-visible:ring-[#1680ff]"
              />
            </div>
          </div>

          {isPending ? (
            <div className="flex justify-center rounded-lg border border-gray-200 py-12">
              <Spinner />
            </div>
          ) : error ? (
            <ErrorState
              title="Tickets could not be loaded"
              description={getErrorMessage(error)}
              onRetry={() => void refetch()}
            />
          ) : tickets.length === 0 ? (
            <EmptyState
              title={search.trim() ? "No matching tickets" : "No tickets found"}
              description={
                search.trim()
                  ? "Try a different search term."
                  : isOpen
                    ? "There are no open support tickets right now."
                    : "There are no closed support tickets yet."
              }
              icon={<Ticket className="h-8 w-8" aria-hidden />}
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-blue-50 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      <th scope="col" className="w-16 px-4 py-3 text-center">
                        S.No
                      </th>
                      <th scope="col" className="px-4 py-3">
                        User ID
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Subject
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-center">
                        Status
                      </th>
                      <th scope="col" className="w-32 px-4 py-3 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {currentTickets.map((ticket, index) => (
                      <tr key={ticket.TicketId} className="transition-colors hover:bg-blue-50/60">
                        <td className="px-4 py-4 text-center font-medium">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-4 py-4">{ticket.UserID || "-"}</td>
                        <td className="px-4 py-4">{ticket.UserName || "-"}</td>
                        <td className="max-w-xs truncate px-4 py-4" title={ticket.Subject}>
                          {ticket.Subject || "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {formatDate(ticket.CreatedDate)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              isOpenTicket(ticket)
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {ticket.StatusType || (isOpenTicket(ticket) ? "Open" : "Closed")}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-[#1680ff] text-white hover:bg-[#126bd6] focus-visible:ring-[#1680ff]"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                            {isOpen ? "Reply" : "Details"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-col items-center justify-between gap-3 text-sm text-gray-600 sm:flex-row">
                <label className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    className="rounded border border-gray-300 bg-white px-2 py-1"
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                  >
                    {[5, 10, 25, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <span>
                  {startIndex + 1}–{Math.min(startIndex + pageSize, tickets.length)} of{" "}
                  {tickets.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="min-w-16 text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {selectedTicket && (
        <TicketDetailsDialog
          ticket={selectedTicket}
          readOnly={!isOpen}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </>
  );
}
