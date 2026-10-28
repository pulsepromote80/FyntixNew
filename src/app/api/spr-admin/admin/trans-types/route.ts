import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function getTokenFromRequest(request: NextRequest): string | null {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const session: unknown = JSON.parse(cookie);
    const token = isRecord(session) ? session.token : undefined;
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

function buildErrorResponse(error: unknown, fallback: string) {
  const rd =
    isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
  const status =
    isRecord(error) &&
    isRecord(error.response) &&
    typeof error.response.status === "number"
      ? error.response.status
      : 502;
  const message =
    isRecord(rd) && typeof rd.message === "string" ? rd.message : fallback;
  return NextResponse.json(
    { message },
    { status: status >= 400 && status < 500 ? status : 502 }
  );
}

// POST /api/admin/trans-types?Type=2
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = Number(searchParams.get("Type") ?? 0);

  if (!type) {
    return NextResponse.json(
      { message: "Type query parameter is required" },
      { status: 400 }
    );
  }

  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const backend = createBackendClient(token);
    // ⚠️ Backend POST leta hai, Type query param mein
    const { data } = await backend.get(
      `/AdminManageUser/getTransType?Type=${type}`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("TransType error:", error);
    return buildErrorResponse(error, "Failed to fetch transaction types");
  }
}