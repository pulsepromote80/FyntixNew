import { NextResponse, type NextRequest } from "next/server";
import { getTicketBackend, ticketApiError } from "@/app/api/spr-admin/admin/tickets/ticket-api-utils";

interface RouteContext {
  params: Promise<{ ticketId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { ticketId } = await context.params;
  if (!ticketId.trim() || ticketId.length > 100) {
    return NextResponse.json({ message: "A valid ticket ID is required." }, { status: 400 });
  }

  const ticketBackend = getTicketBackend(request);
  if (!ticketBackend.ok) return ticketBackend.response;

  try {
    const { data } = await ticketBackend.backend.get(
      `/Ticket/getTicketBYTicketIdAdmin?TicketId=${encodeURIComponent(ticketId)}`,
    );
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin ticket details request failed:", error);
    return ticketApiError(error, "Failed to load ticket details.");
  }
}
