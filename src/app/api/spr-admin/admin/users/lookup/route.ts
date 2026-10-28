import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: NextRequest) {
  const authLogin = request.nextUrl.searchParams.get("authLogin")?.trim();
  if (!authLogin) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
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
    const { data } = await backend.get("/AdminManageUser/userNameByLoginIdAdmin", {
      params: { authLogin },
    });
    return NextResponse.json(data ?? null);
  } catch (error) {
    console.error("Admin user lookup error:", error);
    const responseData =
      isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    const message =
      isRecord(responseData) && typeof responseData.message === "string"
        ? responseData.message
        : "Failed to search user";
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
