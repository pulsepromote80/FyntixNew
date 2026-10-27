import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/lib/backend-client";
import { getServerEnv } from "@/lib/env";
import { isTokenExpired } from "@/lib/jwt";
import { unauthorizedSessionResponse } from "@/lib/session-response";

const ticketTypes = new Set([
  "event",
  "Profile",
  "Withdrawal",
  "buyLicense",
  "income",
  "fund",
  "General",
  "trading",
  "Legacy",
  "LegacyReborn",
  "WithdrawalBooster",
  "LevelBooster",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return unauthorizedSessionResponse(SESSION_COOKIE_NAME, "Not authenticated");
  }

  const { action } = await context.params;
  if (!["list", "create", "detail", "reply"].includes(action)) {
    return errorResponse("Unknown support action.", 404);
  }

  try {
    let session: unknown;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      return unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "Session expired or invalid. Please login again.",
      );
    }

    const token = isRecord(session) ? session.accessToken : undefined;

    if (typeof token !== "string" || !token || isTokenExpired(token)) {
      return unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "Session expired or invalid. Please login again.",
      );
    }

    const backend = createBackendClient(token);
    if (action === "list") {
      const { data } = await backend.get("/Ticket/getAllTicketByURID");
      return NextResponse.json(data);
    }

    if (action === "detail" || action === "reply") {
      let payload: unknown = null;
      if (action === "detail") {
        payload = await request.json().catch(() => null);
      }
      const ticketId =
        action === "reply"
          ? request.nextUrl.searchParams.get("TicketId")
          : isRecord(payload)
            ? payload.ticketId
            : undefined;
      if (
        (typeof ticketId !== "string" && typeof ticketId !== "number") ||
        !String(ticketId).trim()
      ) {
        return errorResponse("A valid ticket ID is required.", 400);
      }

      if (action === "detail") {
        const { data } = await backend.get(
          `/Ticket/getTicketByTicketId?ticketId=${encodeURIComponent(String(ticketId))}`,
        );
        return NextResponse.json(data);
      }

      const message = request.nextUrl.searchParams.get("Message");
      const statusValue = request.nextUrl.searchParams.get("Status");
      const seenValue = request.nextUrl.searchParams.get("Seen");
      const status = statusValue === null ? Number.NaN : Number(statusValue);
      const seen = seenValue === null ? Number.NaN : Number(seenValue);
      if (
        typeof message !== "string" ||
        message.trim().length < 1 ||
        message.trim().length > 1000 ||
        typeof status !== "number" ||
        !Number.isInteger(status) ||
        typeof seen !== "number" ||
        !Number.isInteger(seen)
      ) {
        return errorResponse(
          "Reply details must include a message (1–1,000 characters), integer status, and integer seen value.",
          400,
        );
      }

      const replyForm = new FormData();
      replyForm.set("ImagePath", "");
      const replyParams = new URLSearchParams({
        TicketId: String(ticketId),
        Message: message.trim(),
        Status: String(status),
        Seen: String(seen),
      });
      const replyUrl = `/Ticket/addTicketReply?${replyParams.toString()}`;
      const { data } = await backend.post(replyUrl, replyForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return NextResponse.json(data);
    }

    const formData = await request.formData();
    const ticketType = formData.get("TicketType");
    const subject = formData.get("Subject");
    const message = formData.get("Message");
    const attachment = formData.get("ImagePath");

    if (
      typeof ticketType !== "string" ||
      !ticketTypes.has(ticketType) ||
      typeof subject !== "string" ||
      subject.trim().length < 5 ||
      subject.trim().length > 100 ||
      typeof message !== "string" ||
      message.trim().length < 10 ||
      message.trim().length > 1000
    ) {
      return errorResponse("Please provide valid ticket details.", 400);
    }

    if (attachment && typeof attachment !== "string") {
      if (
        attachment.size > 5 * 1024 * 1024 ||
        !["image/jpeg", "image/png"].includes(attachment.type)
      ) {
        return errorResponse("Attachment must be a JPEG or PNG image smaller than 5 MB.", 400);
      }
    }

    const backendForm = new FormData();
    backendForm.set("TicketType", ticketType);
    backendForm.set("Subject", subject.trim());
    backendForm.set("Message", message.trim());
    backendForm.set("Seen", "1");
    if (attachment && typeof attachment !== "string") {
      backendForm.set("ImagePath", attachment, attachment.name);
    }

    const { data } = await backend.post("/Ticket/addTicket", backendForm, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Support action failed (${action}):`, error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return unauthorizedSessionResponse(
          SESSION_COOKIE_NAME,
          "Session expired or invalid. Please login again.",
        );
      }
      if (error.response) {
        return NextResponse.json(error.response.data, {
          status: error.response.status,
        });
      }
    }

    return errorResponse("Support request failed. Please try again.", 502);
  }
}
