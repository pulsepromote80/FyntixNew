"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FileImage,
  LifeBuoy,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";

type Ticket = Record<string, unknown>;
const TICKETS_PER_PAGE = 10;

const ticketTypes = [
  { value: "trading", label: "Trading Investment" },
  { value: "Legacy", label: "Legacy Reborn" },
  { value: "Withdrawal", label: "Withdrawal" },
  { value: "LegacyReborn", label: "Legacy Reborn 2.0" },
  { value: "WithdrawalBooster", label: "Withdrawal Booster" },
  { value: "fund", label: "Fund Deposit" },
  { value: "LevelBooster", label: "Level Booster" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTickets(payload: unknown, visited = new Set<object>()): Ticket[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }
  if (!isRecord(payload) || visited.has(payload)) {
    return [];
  }
  visited.add(payload);

  for (const key of ["tickets", "ticket", "data", "result"]) {
    const nested = payload[key];
    if (Array.isArray(nested)) {
      return nested.filter(isRecord);
    }
    if (isRecord(nested)) {
      const items = getTickets(nested, visited);
      if (items.length) return items;
    }
  }
  return [];
}

function valueOf(ticket: Ticket, ...keys: string[]) {
  const targetKeys = new Set(keys.map((key) => key.toLowerCase()));
  const entry = Object.entries(ticket).find(([key, value]) => {
    return targetKeys.has(key.toLowerCase()) && value !== null && value !== undefined;
  });
  return entry?.[1];
}

function displayValue(value: unknown, fallback = "—") {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function ticketStatus(ticket: Ticket) {
  return displayValue(
    ticket.statusType ?? ticket.StatusType ?? valueOf(ticket, "status"),
    "Open",
  ).trim();
}

function getTicketDetail(payload: unknown): Ticket | undefined {
  if (!isRecord(payload)) return undefined;
  for (const key of ["ticket", "data", "result"]) {
    const nested = payload[key];
    if (Array.isArray(nested) && isRecord(nested[0])) return nested[0];
    if (isRecord(nested)) {
      const detail = getTicketDetail(nested);
      if (detail) return detail;
    }
  }
  return undefined;
}

function getTicketReplies(payload: unknown): Ticket[] {
  if (!isRecord(payload)) return [];
  for (const key of ["replies", "data", "result"]) {
    const nested = payload[key];
    if (Array.isArray(nested) && nested.every(isRecord)) return nested;
    if (isRecord(nested)) {
      const replies = getTicketReplies(nested);
      if (replies.length) return replies;
    }
  }
  return [];
}

function findTicketImage(payload: unknown, visited = new Set<object>()): string | undefined {
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const image = findTicketImage(item, visited);
      if (image) return image;
    }
    return undefined;
  }
  if (!isRecord(payload) || visited.has(payload)) return undefined;
  visited.add(payload);

  const imageValue = payload.imagePath ?? payload.ImagePath ?? payload.imageUrl ?? payload.ImageUrl;
  if (typeof imageValue === "string" && imageValue.trim()) return imageValue.trim();

  for (const value of Object.values(payload)) {
    const image = findTicketImage(value, visited);
    if (image) return image;
  }
  return undefined;
}

async function parseResponse(response: Response) {
  const payload: unknown = await response.json();
  if (
    !response.ok ||
    (isRecord(payload) && payload.success === false) ||
    (isRecord(payload) && typeof payload.statusCode === "number" && payload.statusCode !== 200)
  ) {
    throw new Error(
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "Support request failed.",
    );
  }
  return payload;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketDetails, setTicketDetails] = useState<unknown>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [ticketPage, setTicketPage] = useState(1);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/support/list", { method: "POST" });
      const payload = await parseResponse(response);
      setTickets(getTickets(payload));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not load support tickets.";
      setLoadError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedTicket) {
      setTicketDetails(null);
      setReplyMessage("");
      return;
    }

    let active = true;
    const ticketId = valueOf(selectedTicket, "TicketId", "ticketId", "id");
    if (ticketId === undefined || ticketId === "") {
      toast.error("Ticket ID is unavailable.");
      setSelectedTicket(null);
      return;
    }

    setDetailsLoading(true);
    fetch("/api/support/detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    })
      .then(parseResponse)
      .then((payload) => {
        if (active) setTicketDetails(payload);
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Could not load ticket details.");
        }
      })
      .finally(() => {
        if (active) setDetailsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedTicket]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tickets;
    return tickets.filter((ticket) =>
      [
        valueOf(ticket, "Subject", "subject"),
        valueOf(ticket, "TicketType", "ticketType"),
        ticketStatus(ticket),
      ]
        .map((value) => displayValue(value, "").toLowerCase())
        .some((value) => value.includes(query)),
    );
  }, [search, tickets]);
  const totalTicketPages = Math.max(1, Math.ceil(filteredTickets.length / TICKETS_PER_PAGE));
  const currentTicketPage = Math.min(ticketPage, totalTicketPages);
  const visibleTickets = filteredTickets.slice(
    (currentTicketPage - 1) * TICKETS_PER_PAGE,
    currentTicketPage * TICKETS_PER_PAGE,
  );

  async function submitTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticketType || subject.trim().length < 5 || subject.trim().length > 100) {
      toast.error("Choose a ticket type and enter a subject between 5 and 100 characters.");
      return;
    }
    if (message.trim().length < 10 || message.trim().length > 1000) {
      toast.error("Message must be between 10 and 1,000 characters.");
      return;
    }

    const formData = new FormData();
    formData.set("TicketType", ticketType);
    formData.set("Subject", subject.trim());
    formData.set("Message", message.trim());
    if (attachment) formData.set("ImagePath", attachment);

    setSubmitting(true);
    try {
      const response = await fetch("/api/support/create", {
        method: "POST",
        body: formData,
      });
      const payload = await parseResponse(response);
      toast.success(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Support ticket created.",
      );
      setTicketType("");
      setSubject("");
      setMessage("");
      setAttachment(null);
      setShowForm(false);
      await loadTickets();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create support ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    const ticketId = valueOf(selectedTicket, "TicketId", "ticketId", "id");
    if (ticketId === undefined) {
      toast.error("Ticket ID is unavailable.");
      return;
    }

    setReplySubmitting(true);
    try {
      const replyParams = new URLSearchParams({
        TicketId: String(ticketId),
        Message: replyMessage.trim(),
        Status: "1",
        Seen: "1",
      });
      const response = await fetch(`/api/support/reply?${replyParams.toString()}`, {
        method: "POST",
      });
      await parseResponse(response);
      toast.success("Reply sent.");
      setReplyMessage("");
      const detailResponse = await fetch("/api/support/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      setTicketDetails(await parseResponse(detailResponse));
      await loadTickets();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your reply.");
    } finally {
      setReplySubmitting(false);
    }
  }

  async function openTicketImage(ticket: Ticket) {
    const existingImage = findTicketImage(ticket);
    if (existingImage) {
      setPreviewImage(existingImage);
      return;
    }

    const ticketId = valueOf(ticket, "TicketId", "ticketId", "id");
    if (ticketId === undefined || ticketId === "") {
      toast.error("Ticket ID is unavailable.");
      return;
    }

    try {
      const response = await fetch("/api/support/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const payload = await parseResponse(response);
      const image = findTicketImage(payload);
      if (!image) {
        toast.error("No image attachment is available for this ticket.");
        return;
      }
      setPreviewImage(image);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load ticket image.");
    }
  }

  return (
    <div className="space-y-6 px-4">
      <PageHeader
        title="Support"
        description="Create a support ticket and follow up on your requests."
        actions={
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ea8f06] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:-translate-y-0.5 hover:brightness-110"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Create Ticket"}
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={submitTicket}
          className="bg-card rounded-2xl border border-border p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Create Support Ticket</h2>
              <p className="text-sm text-muted-foreground">
                Tell us what you need help with. Our team will follow up here.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-foreground">
              Ticket type
              <select
                required
                value={ticketType}
                onChange={(event) => setTicketType(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal"
              >
                <option value="">Select ticket type</option>
                {ticketTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Subject
              <input
                required
                minLength={5}
                maxLength={100}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal"
                placeholder="Briefly describe the issue"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground md:col-span-2">
              Message
              <textarea
                required
                minLength={10}
                maxLength={1000}
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 font-normal"
                placeholder="Add details that will help us resolve your request"
              />
              <span className="block text-right text-xs font-normal text-muted-foreground">
                {message.length}/1000
              </span>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground md:col-span-2">
              Attachment{" "}
              <span className="font-normal text-muted-foreground">
                (optional, JPEG/PNG up to 5 MB)
              </span>
              <span className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-3 font-normal text-muted-foreground">
                <FileImage className="h-4 w-4 shrink-0" />
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                  className="min-w-0 flex-1 text-sm"
                />
              </span>
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#ea8f06] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d47d05] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Generate Ticket"}
            </button>
          </div>
        </form>
      )}

      <section className="bg-card overflow-hidden rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Support Tickets</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
            </p>
          </div>
          <div className="flex gap-2">
            <label className="relative min-w-0 flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setTicketPage(1);
                }}
                placeholder="Search tickets"
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => void loadTickets()}
              disabled={loading}
              aria-label="Refresh support tickets"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#F5C451]" aria-label="Loading tickets" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="max-w-lg text-sm text-muted-foreground">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadTickets()}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Try again
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <LifeBuoy className="mx-auto h-9 w-9 text-muted-foreground/60" />
            <p className="mt-3 font-medium text-foreground">
              {search ? "No matching tickets" : "No support tickets yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try a different search." : "Create a ticket if you need help."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">S. No.</th>
                  <th className="px-5 py-3 font-medium">Ticket Type</th>
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 text-center font-medium">Image</th>
                  <th className="px-5 py-3 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleTickets.map((ticket, index) => {
                  const status = ticketStatus(ticket);
                  const isOpen = status.toLowerCase() === "open";
                  const id = displayValue(
                    valueOf(ticket, "TicketId", "ticketId", "id"),
                    String((currentTicketPage - 1) * TICKETS_PER_PAGE + index),
                  );
                  return (
                    <tr key={id} className="text-foreground">
                      <td className="px-5 py-4 text-muted-foreground">
                        {(currentTicketPage - 1) * TICKETS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-5 py-4">
                        {displayValue(valueOf(ticket, "TicketType", "ticketType"))}
                      </td>

                      <td className="max-w-md truncate px-5 py-4 font-medium">
                        {displayValue(valueOf(ticket, "Subject", "subject"))}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isOpen
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-300"
                            }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {displayValue(valueOf(ticket, "CreatedDate", "createdDate", "Date"))}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => void openTicketImage(ticket)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-500/10 dark:text-blue-400"
                          aria-label="View ticket attachment"
                        >
                          <FileImage className="h-4 w-4" />
                          View
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${isOpen ? "bg-[#ea8f06]" : "bg-slate-600 hover:bg-slate-700"
                            }`}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {isOpen ? "Reply" : "Detail"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !loadError && filteredTickets.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentTicketPage - 1) * TICKETS_PER_PAGE + 1} to{" "}
              {Math.min(currentTicketPage * TICKETS_PER_PAGE, filteredTickets.length)} of{" "}
              {filteredTickets.length} tickets
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTicketPage((page) => Math.max(1, page - 1))}
                disabled={currentTicketPage === 1}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="min-w-16 text-center text-sm text-muted-foreground">
                {currentTicketPage} / {totalTicketPages}
              </span>
              <button
                type="button"
                onClick={() => setTicketPage((page) => Math.min(totalTicketPages, page + 1))}
                disabled={currentTicketPage === totalTicketPages}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTicket(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-detail-title"
            className="bg-card flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-black shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <h2 id="ticket-detail-title" className="text-lg font-semibold text-foreground">
                  {ticketStatus(selectedTicket).toLowerCase() === "open"
                    ? "Ticket Details"
                    : "Closed Ticket Details"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {displayValue(valueOf(selectedTicket, "Subject", "subject"))}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close ticket details"
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="grid grid-cols-2 gap-4 border-b border-border p-5 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="mt-1 font-medium text-foreground">
                  {displayValue(
                    valueOf(
                      getTicketDetail(ticketDetails) ?? selectedTicket,
                      "TicketType",
                      "ticketType",
                    ),
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ticketStatus(selectedTicket).toLowerCase() === "open"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-slate-500/10 text-slate-600 dark:text-slate-300"
                    }`}
                >
                  {ticketStatus(selectedTicket)}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="mt-1 font-medium text-foreground">
                  {displayValue(valueOf(selectedTicket, "CreatedDate", "createdDate", "Date"))}
                </p>
              </div>

              <p className="text-sm font-medium text-foreground">Conversation</p>
            </div>



            {detailsLoading ? (
              <div className="space-y-3 p-5">
                <div className="h-12 animate-pulse rounded-lg bg-muted" />
                <div className="h-12 animate-pulse rounded-lg bg-muted" />
              </div>
            ) : (
              <div className="min-h-32 flex-1 space-y-1 overflow-y-auto bg-muted/20 p-5">
                {getTicketReplies(ticketDetails).length ? (
                  getTicketReplies(ticketDetails).map((reply, index) => {
                    const fromUser = Number(valueOf(reply, "Status", "status")) === 1;
                    return (
                      <div
                        key={displayValue(valueOf(reply, "id", "ReplyId"), String(index))}
                        className={`flex ${fromUser ? "justify-end" : "justify-start"}`}
                      >
                        <article
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${fromUser
                            ? "rounded-br-sm bg-blue-600 text-white"
                            : "bg-card rounded-bl-sm border border-border text-foreground"
                            }`}
                        >

                          <p className="whitespace-pre-wrap break-words">
                            {displayValue(valueOf(reply, "Messages", "messages"), "")}
                          </p>
                          <p
                            className={`mt-2 text-right text-[11px] ${fromUser ? "text-blue-100" : "text-muted-foreground"
                              }`}
                          >
                            {displayValue(valueOf(reply, "ReplyDate", "CreatedDate", "Date"), "")}
                          </p>
                        </article>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No conversation messages yet.
                  </p>
                )}
              </div>
            )}

            {ticketStatus(selectedTicket).toLowerCase() === "open" && (
              <form onSubmit={submitReply} className="border-t border-border p-4 sm:p-5">
                <label
                  htmlFor="ticket-reply"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Reply
                </label>
                <textarea
                  id="ticket-reply"
                  required
                  maxLength={1000}
                  rows={3}
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  placeholder="Type your reply..."
                  className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{replyMessage.length}/1000</span>
                  <button
                    type="submit"
                    disabled={replySubmitting || detailsLoading || !replyMessage.trim()}
                    className="rounded-lg bg-[#ea8f06] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d47d05] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {replySubmitting ? "Sending…" : "Send Reply"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewImage(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Ticket image preview"
            className="bg-card relative max-h-[90vh] w-full max-w-4xl rounded-2xl p-3 shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close image preview"
              onClick={() => setPreviewImage(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Support ticket attachment"
              className="mx-auto max-h-[calc(90vh-1.5rem)] w-auto max-w-full rounded-lg object-contain"
            />
          </section>
        </div>
      )}
    </div>
  );
}
