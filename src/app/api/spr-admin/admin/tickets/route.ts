import { NextResponse, type NextRequest } from "next/server";
import { getTicketBackend, ticketApiError } from "@/app/api/spr-admin/admin/tickets/ticket-api-utils";

export async function GET(request: NextRequest) {
  const status = new URL(request.url).searchParams.get("status");
  if (status !== "open" && status !== "closed") {
    return NextResponse.json(
      { message: "Ticket status must be 'open' or 'closed'." },
      { status: 400 },
    );
  }

  const ticketBackend = getTicketBackend(request);
  if (!ticketBackend.ok) return ticketBackend.response;

  try {
    const endpoint = status === "open" ? "/Ticket/getAllTicketAdmin" : "/Ticket/getAllclosedTicket";
    const { data } = await ticketBackend.backend.get(endpoint);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin tickets list request failed:", error);
    return ticketApiError(error, "Failed to load tickets.");
  }
}
