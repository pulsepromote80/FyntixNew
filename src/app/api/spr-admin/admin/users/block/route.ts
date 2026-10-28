import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";
import { rateLimit, getClientIp } from "@/spr-admin/lib/rate-limiter";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  const authLogin = request.nextUrl.searchParams.get("authLogin")?.trim();
  const activeParam = request.nextUrl.searchParams.get("active");
  if (!authLogin || (activeParam !== "0" && activeParam !== "1")) {
    return NextResponse.json(
      { message: "A user ID and valid active status query parameter are required" },
      { status: 400 },
    );
  }
  const active: 0 | 1 = activeParam === "1" ? 1 : 0;

  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let token: unknown;
  try {
    const session: unknown = JSON.parse(sessionCookie);
    token = isRecord(session) ? session.token : undefined;
  } catch {
    return NextResponse.json({ message: "Invalid session" }, { status: 401 });
  }
  if (typeof token !== "string" || !token) {
    return NextResponse.json({ message: "Invalid session" }, { status: 401 });
  }

  // Rate limiting: 10 requests per minute per IP
  const ip = getClientIp(request);
  const limiter = rateLimit({ limit: 10, windowMs: 60 * 1000 });
  const rateLimitResult = await limiter(`${ip}:block-user`);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        message: "Too many requests. Please slow down.",
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimitResult.resetTime),
        },
      },
    );
  }

  try {
    const backend = createBackendClient(token);
    const { data } = await backend.post("/AdminAuthentication/blockUserByAdmin", undefined, {
      params: {
        authLogin,
        Active: active,
      },
    });
    return NextResponse.json(data ?? null);
  } catch (error) {
    console.error("Admin block user error:", error);
    const responseData =
      isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    const message =
      isRecord(responseData) && typeof responseData.message === "string"
        ? responseData.message
        : "Failed to update user status";
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
