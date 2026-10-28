import { NextResponse, type NextRequest } from "next/server";
import { getTicketBackend, ticketApiError } from "@/app/api/spr-admin/admin/tickets/ticket-api-utils";

export async function POST(request: NextRequest) {
  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json({ message: "A valid form submission is required." }, { status: 400 });
  }

  const ticketId = incoming.get("TicketId");
  const message = incoming.get("Message");
  if (
    typeof ticketId !== "string" ||
    !ticketId.trim() ||
    ticketId.length > 100 ||
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 10000
  ) {
    return NextResponse.json(
      { message: "A valid ticket ID and reply message are required." },
      { status: 400 },
    );
  }

  const ticketBackend = getTicketBackend(request);
  if (!ticketBackend.ok) return ticketBackend.response;

  const body = new FormData();
  for (const field of ["TicketId", "Message", "CreatedBy", "Status", "Seen", "ImagePath"]) {
    const value = incoming.get(field);
    if (typeof value === "string" || value instanceof Blob) body.set(field, value);
  }

  try {
    const { data } = await ticketBackend.backend.post("/Ticket/addTicketReplyAdmin", body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin ticket reply request failed:", error);
    return ticketApiError(error, "Failed to send ticket reply.");
  }
}
