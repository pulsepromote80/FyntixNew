import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketsService } from "@/spr-admin/features/tickets/services/tickets.service";
import {
  normalizeTicketDetails,
  normalizeTicketList,
  type TicketRecord,
  type TicketStatus,
} from "@/spr-admin/features/tickets/types";

const ticketQueryKeys = {
  list: (status: TicketStatus) => ["admin-tickets", status] as const,
  details: (ticketId: string) => ["admin-ticket", ticketId] as const,
};

export function useAdminTickets(status: TicketStatus) {
  return useQuery({
    queryKey: ticketQueryKeys.list(status),
    queryFn: async () => normalizeTicketList(await ticketsService.list(status)),
  });
}

export function useTicketDetails(ticketId: string) {
  return useQuery({
    queryKey: ticketQueryKeys.details(ticketId),
    queryFn: async () => normalizeTicketDetails(await ticketsService.details(ticketId)),
    enabled: Boolean(ticketId),
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: FormData) => ticketsService.reply(body),
    onSuccess: async (_response, body) => {
      const ticketId = body.get("TicketId");
      if (typeof ticketId !== "string") return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketQueryKeys.list("open") }),
        queryClient.invalidateQueries({ queryKey: ticketQueryKeys.details(ticketId) }),
      ]);
    },
  });
}

export function useCloseTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => ticketsService.close(ticketId),
    onSuccess: async (_response, ticketId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketQueryKeys.list("open") }),
        queryClient.invalidateQueries({ queryKey: ticketQueryKeys.list("closed") }),
        queryClient.invalidateQueries({ queryKey: ticketQueryKeys.details(ticketId) }),
      ]);
    },
  });
}

export function makeTicketReplyForm(ticket: TicketRecord, message: string): FormData {
  const body = new FormData();
  body.append("TicketId", ticket.TicketId);
  body.append("Message", message.trim());
  body.append("CreatedBy", ticket.TicketId);
  body.append("Status", "0");
  body.append("Seen", "0");
  body.append("ImagePath", ticket.ImagePath ?? "");
  return body;
}
