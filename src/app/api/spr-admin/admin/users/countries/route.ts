import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
// GET /api/geography/countries
// → Backend: GET /Geography/getAllCountry
// ============================================
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const backend = createBackendClient(token);
    const { data } = await backend.get("/Geography/getAllCountry");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Country list error:", error);
    return buildErrorResponse(error, "Failed to fetch countries");
  }
}