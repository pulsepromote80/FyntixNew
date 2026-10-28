import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const authLogin = searchParams.get("AuthLogin");

    if (!authLogin) {
      return NextResponse.json({ message: "AuthLogin is required" }, { status: 400 });
    }

    const backend = createBackendClient(token);
    const { data } = await backend.post(`/Community/getNetworkTreeAdmin_Admin?AuthLogin=${authLogin}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Network tree error:", error);
    const responseData =
      isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    const message =
      isRecord(responseData) && typeof responseData.message === "string"
        ? responseData.message
        : "Failed to fetch network tree data";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
