import { NextResponse, type NextRequest } from "next/server";
import type { AxiosInstance } from "axios";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";

type TicketBackendResult =
  { ok: true; backend: AxiosInstance } | { ok: false; response: NextResponse };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getTicketBackend(request: NextRequest): TicketBackendResult {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Not authenticated" }, { status: 401 }),
    };
  }

  let session: unknown;
  try {
    session = JSON.parse(cookie);
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ message: "Invalid session" }, { status: 401 }),
    };
  }

  const token = isRecord(session) ? session.token : undefined;
  if (typeof token !== "string" || !token) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Invalid session" }, { status: 401 }),
    };
  }
  return { ok: true, backend: createBackendClient(token) };
}

export function ticketApiError(error: unknown, fallback: string) {
  const response = isRecord(error) && isRecord(error.response) ? error.response : undefined;
  const data = response && isRecord(response.data) ? response.data : undefined;
  const message = data && typeof data.message === "string" ? data.message : fallback;
  const status =
    response &&
    typeof response.status === "number" &&
    response.status >= 400 &&
    response.status < 500
      ? response.status
      : 502;
  return NextResponse.json({ message }, { status });
}
