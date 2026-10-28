import { apiClient } from "@/spr-admin/lib/api-client";
import type { TicketStatus } from "@/spr-admin/features/tickets/types";

const TICKETS_API = "/admin/tickets";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ensureSuccess(payload: unknown, fallback: string): unknown {
  if (!isRecord(payload)) return payload;
  const statusCode = payload.statusCode;
  if ((typeof statusCode === "number" && statusCode >= 400) || payload.success === false) {
    throw new Error(typeof payload.message === "string" ? payload.message : fallback);
  }
  return payload;
}

export const ticketsService = {
  list: (status: TicketStatus) => apiClient.get<unknown>(`${TICKETS_API}?status=${status}`),
  details: (ticketId: string) =>
    apiClient.get<unknown>(`${TICKETS_API}/${encodeURIComponent(ticketId)}`),
  reply: async (body: FormData) =>
    ensureSuccess(
      await apiClient.post<unknown, FormData>(`${TICKETS_API}/reply`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
      "Failed to send ticket reply.",
    ),
  close: async (ticketId: string) =>
    ensureSuccess(
      await apiClient.post<unknown>(`${TICKETS_API}/${encodeURIComponent(ticketId)}/close`),
      "Failed to close ticket.",
    ),
};
