"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Paperclip,
  Send,
  Ticket,
  UserRound,
  X,
  CircleDot,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/spr-admin/components/ui/Button";
import { ErrorState } from "@/spr-admin/components/ui/ErrorState";
import { Modal } from "@/spr-admin/components/ui/Modal";
import {
  makeTicketReplyForm,
  useCloseTicket,
  useReplyToTicket,
  useTicketDetails,
} from "@/spr-admin/features/tickets/hooks/useAdminTickets";
import type { TicketRecord, TicketReply } from "@/spr-admin/features/tickets/types";

interface TicketDetailsDialogProps {
  ticket: TicketRecord;
  readOnly: boolean;
  onClose: () => void;
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isAdminReply(reply: TicketReply): boolean {
  return reply.Status === 0 || reply.Status === "0";
}

function getMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function TicketDetailsDialog({ ticket, readOnly, onClose }: TicketDetailsDialogProps) {
  const { data, isPending, error, refetch } = useTicketDetails(ticket.TicketId);
  const replyMutation = useReplyToTicket();
  const closeMutation = useCloseTicket();
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const detailsTicket = data?.ticket[0] ?? ticket;
  const ticketIsOpen = detailsTicket.Status === 1 || detailsTicket.Status === "1";
  const statusLabel = detailsTicket.StatusType || (ticketIsOpen ? "Open" : "Closed");
  const replies = [...(data?.replies ?? [])].sort((first, second) => {
    const firstDate = first.ReplyDate ? new Date(first.ReplyDate).getTime() : Number.NaN;
    const secondDate = second.ReplyDate ? new Date(second.ReplyDate).getTime() : Number.NaN;
    if (!Number.isFinite(firstDate) || !Number.isFinite(secondDate)) return 0;
    return firstDate - secondDate;
  });

  useEffect(() => {
    if (isPending || !data || replies.length === 0) return;
    const frame = window.requestAnimationFrame(() => {
      const content = contentRef.current;
      if (content) content.scrollTo({ top: content.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [data, isPending, replies.length]);

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a reply before sending.");
      return;
    }

    try {
      await replyMutation.mutateAsync(makeTicketReplyForm(detailsTicket, message));
      setMessage("");
      toast.success("Reply sent successfully.");
    } catch (mutationError) {
      toast.error(getMessage(mutationError, "Failed to send reply."));
    }
  }

  async function handleCloseTicket() {
    try {
      await closeMutation.mutateAsync(detailsTicket.TicketId);
      toast.success("Ticket closed successfully.");
      onClose();
    } catch (mutationError) {
      toast.error(getMessage(mutationError, "Failed to close ticket."));
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Ticket Details"
      showHeader={false}
      className="spr-admin-ticket-dialog h-[min(92vh,800px)] max-h-[92vh] max-w-[600px] overflow-hidden bg-[#F5F9FF] p-0"
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1680ff]">
              <Ticket className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">Ticket Details</h2>
              <p className="truncate text-xs text-gray-500">Ticket #{detailsTicket.TicketId}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                ticketIsOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {ticketIsOpen ? (
                <CircleDot className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              )}
              {statusLabel}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close ticket details"
              className="rounded-md p-1 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1680ff]"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={contentRef}
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pb-6 pt-5 sm:gap-7 sm:px-7"
        >
          {isPending ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader2
                className="h-7 w-7 animate-spin text-[#1680ff]"
                aria-label="Loading ticket details"
              />
            </div>
          ) : error ? (
            <ErrorState
              title="Ticket details could not be loaded"
              description={getMessage(error, "Please try again.")}
              onRetry={() => void refetch()}
            />
          ) : (
            <>
              <section
                aria-label="Ticket information"
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 sm:gap-y-6">
                  <InfoItem icon={<UserRound />} label="User ID" value={detailsTicket.UserID} />
                  <InfoItem icon={<UserRound />} label="Name" value={detailsTicket.UserName} />
                  <InfoItem
                    icon={<CalendarDays />}
                    label="Date"
                    value={formatDate(detailsTicket.CreatedDate)}
                  />
                  <InfoItem icon={<Ticket />} label="Type" value={detailsTicket.TicketType} />
                  <InfoItem
                    icon={<MessageCircle />}
                    label="Subject"
                    value={detailsTicket.Subject}
                  />
                  <InfoItem icon={<Ticket />} label="Status" value={statusLabel} />
                </div>
              </section>

              {detailsTicket.ImagePath && (
                <a
                  href={detailsTicket.ImagePath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  <Paperclip className="h-4 w-4" aria-hidden />
                  View ticket attachment
                </a>
              )}

              <section className="flex min-h-48 flex-col" aria-label="Ticket conversation">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
                    <MessageCircle className="h-4 w-4 text-[#1680ff]" aria-hidden />
                    Conversation
                  </h3>
                  <span className="rounded-full bg-gray-200/70 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {replies.length} {replies.length === 1 ? "message" : "messages"}
                  </span>
                </div>
                <div className="flex min-h-32 flex-col gap-3 rounded-xl border border-gray-200 bg-white/70 p-3 sm:p-4">
                  {replies.length === 0 ? (
                    <p className="flex min-h-32 items-center justify-center py-6 text-center text-base text-gray-500">
                      No replies yet.
                    </p>
                  ) : (
                    replies.map((reply, index) => {
                      const fromAdmin = isAdminReply(reply);
                      return (
                        <div
                          key={reply.id ?? `${reply.ReplyDate ?? "reply"}-${index}`}
                          className={`flex ${fromAdmin ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[82%] ${
                              fromAdmin
                                ? "rounded-br-md bg-[#1680ff] text-white"
                                : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                            }`}
                          >
                            <div className="mb-1.5 flex items-center justify-between gap-6">
                              <p
                                className={`text-xs font-bold ${
                                  fromAdmin ? "text-blue-100" : "text-blue-700"
                                }`}
                              >
                                {reply.Name || (fromAdmin ? "Admin" : "User")}
                              </p>
                              <time className="text-[11px] text-gray-600">
                                {formatDate(reply.ReplyDate)}
                              </time>
                            </div>
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              {reply.Message || ""}
                            </p>
                            {reply.ImagePath && (
                              <a
                                href={reply.ImagePath}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block underline"
                              >
                                View attachment
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {!readOnly && (
          <div className="mt-2 shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">
            <form onSubmit={handleReply} className="space-y-4">
              <label htmlFor="ticket-reply" className="sr-only">
                Type your reply
              </label>
              <textarea
                id="ticket-reply"
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type your reply..."
                disabled={isPending || Boolean(error)}
                className="w-full resize-y rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1680ff] focus:ring-2 focus:ring-[#1680ff]/30 disabled:bg-gray-50 sm:min-h-24"
              />
              <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending || Boolean(error) || replyMutation.isPending}
                  onClick={() => setConfirmation(true)}
                >
                  Close Ticket
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1680ff] text-white hover:bg-[#126bd6] focus-visible:ring-[#1680ff]"
                  isLoading={replyMutation.isPending}
                  disabled={isPending || Boolean(error) || closeMutation.isPending}
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Send Reply
                </Button>
              </div>
            </form>
          </div>
        )}

        {confirmation && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-[2px]">
            <section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="close-ticket-title"
              aria-describedby="close-ticket-description"
              className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 id="close-ticket-title" className="text-lg font-bold text-gray-900">
                    Close this ticket?
                  </h3>
                  <p id="close-ticket-description" className="mt-1 text-sm leading-6 text-gray-600">
                    This ticket will be marked as closed. You can still view it later in Ticket
                    Logs.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={closeMutation.isPending}
                  onClick={() => setConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  isLoading={closeMutation.isPending}
                  onClick={() => void handleCloseTicket()}
                >
                  Confirm Close
                </Button>
              </div>
            </section>
          </div>
        )}
      </div>
    </Modal>
  );
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 shrink-0 text-[#1680ff] [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 break-words text-base font-semibold text-gray-900">{value || "-"}</p>
      </div>
    </div>
  );
}
