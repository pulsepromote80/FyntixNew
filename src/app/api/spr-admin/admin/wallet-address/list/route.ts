import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function getErrorResponse(error: unknown) {
  const response = isRecord(error) && isRecord(error.response) ? error.response : undefined;
  const data = response && isRecord(response.data) ? response.data : undefined;
  const status = response && typeof response.status === "number" ? response.status : 502;
  const message =
    data && typeof data.message === "string"
      ? data.message
      : data && typeof data.Message === "string"
        ? data.Message
        : "Failed to load wallet addresses.";

  return NextResponse.json({ message }, { status: status >= 400 && status < 500 ? status : 502 });
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const backend = createBackendClient(token);
    const { data } = await backend.get("/Self/getUserWalletAddressListForAdmin");
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin wallet address list request failed:", error);
    return getErrorResponse(error);
  }
}
