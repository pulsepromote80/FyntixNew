import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";

interface BulkRegistrationPayload {
  IntroAuthlogin: string;
  IntroSide: "L" | "R";
  FName: string;
  LName: string;
  Mobile: string;
  Email: string;
  Password: string;
  NoOfId: number;
  CountryId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getBackendErrorMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (!isRecord(value)) return null;

  for (const key of ["message", "detail", "title", "Message", "Detail", "Title"]) {
    const message = value[key];
    if (typeof message === "string" && message.trim()) return message;
  }

  const errors = value.errors ?? value.Errors;
  if (isRecord(errors)) {
    const messages = Object.values(errors).flatMap((entry) =>
      Array.isArray(entry)
        ? entry.filter((message): message is string => typeof message === "string")
        : typeof entry === "string"
          ? [entry]
          : [],
    );
    if (messages.length > 0) return messages.join(" ");
  }

  return null;
}

function isBulkRegistrationPayload(value: unknown): value is BulkRegistrationPayload {
  return (
    isRecord(value) &&
    typeof value.IntroAuthlogin === "string" &&
    Boolean(value.IntroAuthlogin.trim()) &&
    (value.IntroSide === "L" || value.IntroSide === "R") &&
    typeof value.FName === "string" &&
    Boolean(value.FName.trim()) &&
    typeof value.LName === "string" &&
    Boolean(value.LName.trim()) &&
    typeof value.Mobile === "string" &&
    /^\d{10,15}$/.test(value.Mobile.trim()) &&
    typeof value.Email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.Email.trim()) &&
    typeof value.Password === "string" &&
    Boolean(value.Password.trim()) &&
    typeof value.NoOfId === "number" &&
    Number.isInteger(value.NoOfId) &&
    value.NoOfId >= 1 &&
    value.NoOfId <= 50 &&
    typeof value.CountryId === "string" &&
    Boolean(value.CountryId.trim())
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required" }, { status: 400 });
  }

  if (!isBulkRegistrationPayload(body)) {
    return NextResponse.json(
      { message: "Invalid registration details. The number of IDs must be between 1 and 50." },
      { status: 400 },
    );
  }

  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const session: unknown = JSON.parse(sessionCookie);
    const token = isRecord(session) ? session.token : undefined;
    if (typeof token !== "string" || !token) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const backend = createBackendClient(token);
    const { data } = await backend.post("/AdminManageUser/addBulkRegsitration", {
      ...body,
      IntroAuthlogin: body.IntroAuthlogin.trim(),
      FName: body.FName.trim(),
      LName: body.LName.trim(),
      Mobile: body.Mobile.trim(),
      Email: body.Email.trim(),
      CountryId: body.CountryId.trim(),
    });
    return NextResponse.json(data ?? null);
  } catch (error) {
    console.error("Bulk registration error:", error);
    const responseData =
      isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    const message = getBackendErrorMessage(responseData) ?? "Bulk registration failed";
    const responseStatus =
      isRecord(error) &&
      isRecord(error.response) &&
      typeof error.response.status === "number" &&
      error.response.status >= 400 &&
      error.response.status < 600
        ? error.response.status
        : null;
    const status = responseStatus ?? 502;

    return NextResponse.json(
      {
        message,
        ...(responseStatus === null ? { code: "BACKEND_UNAVAILABLE" } : {}),
      },
      { status },
    );
  }
}
