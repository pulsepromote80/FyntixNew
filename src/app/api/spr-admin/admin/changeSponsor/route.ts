import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

// ============================================
// Types
// ============================================
interface ChangeSponsorPayload {
  AuthLogin: string;
  SponsorAuthLogin: string;
}

// ============================================
// Helpers
// ============================================
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isChangeSponsorPayload(value: unknown): value is ChangeSponsorPayload {
  return (
    isRecord(value) &&
    typeof value.AuthLogin === "string" &&
    value.AuthLogin.trim() !== "" &&
    typeof value.SponsorAuthLogin === "string" &&
    value.SponsorAuthLogin.trim() !== ""
  );
}

function getTokenFromRequest(request: NextRequest): string | null {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const session: unknown = JSON.parse(sessionCookie);
    const token = isRecord(session) ? session.token : undefined;
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

function buildErrorResponse(error: unknown, fallbackMessage: string) {
  const responseData =
    isRecord(error) && isRecord(error.response) ? error.response.data : undefined;

  const message =
    isRecord(responseData) && typeof responseData.message === "string"
      ? responseData.message
      : fallbackMessage;

  const backendStatus =
    isRecord(error) &&
    isRecord(error.response) &&
    typeof error.response.status === "number" &&
    error.response.status >= 400 &&
    error.response.status < 500
      ? error.response.status
      : 502;

  return NextResponse.json({ message }, { status: backendStatus });
}

// ============================================
// POST — Change Sponsor
// ============================================
export async function POST(request: NextRequest) {
  // 1. Body parse
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "A valid JSON body is required" },
      { status: 400 }
    );
  }

  // 2. Validate
  if (!isChangeSponsorPayload(body)) {
    return NextResponse.json(
      { message: "AuthLogin and SponsorAuthLogin are required" },
      { status: 400 }
    );
  }

  // 3. Session token
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // 4. Guard — user & sponsor cannot be same
  if (body.AuthLogin.trim() === body.SponsorAuthLogin.trim()) {
    return NextResponse.json(
      { message: "User ID and Sponsor ID cannot be the same" },
      { status: 400 }
    );
  }

  // 5. Backend call
  try {
    const backend = createBackendClient(token);
    const { data } = await backend.post(
      "/AdminManageUser/chanegAdminSponsorID",
      {
        AuthLogin: body.AuthLogin.trim(),
        SponsorAuthLogin: body.SponsorAuthLogin.trim(),
      }
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin change sponsor error:", error);
    return buildErrorResponse(error, "Failed to change sponsor");
  }
}