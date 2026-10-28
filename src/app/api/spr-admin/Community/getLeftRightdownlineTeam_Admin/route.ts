import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

interface DownlineTeamPayload {
  AuthLogin: string;
  side: string;
  FromDate: string;
  ToDate: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDownlineTeamPayload(value: unknown): value is DownlineTeamPayload {
  return (
    isRecord(value) &&
    typeof value.AuthLogin === "string" &&
    typeof value.side === "string" &&
    typeof value.FromDate === "string" &&
    typeof value.ToDate === "string"
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required" }, { status: 400 });
  }

  if (!isDownlineTeamPayload(body)) {
    return NextResponse.json(
      { message: "AuthLogin, side, FromDate, and ToDate must be provided as strings" },
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
    const { data } = await backend.post("/Community/getLeftRightdownlineTeam_Admin", body);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Downline team error:", error);
    const responseData =
      isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    const message =
      isRecord(responseData) && typeof responseData.message === "string"
        ? responseData.message
        : "Failed to fetch downline team data";
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
}
