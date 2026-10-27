import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const body = await request.json().catch(() => null);

  if (!body?.accessToken) {
    return NextResponse.json(
      { success: false, message: "accessToken is required" },
      { status: 400 },
    );
  }

  const { accessToken, userData } = body;

  // ✅ Same pattern as login route
  const sessionData = JSON.stringify({
    accessToken,
    userData: userData ?? null,
  });

  const response = NextResponse.json({
    success: true,
    data: userData,
  });

  response.cookies.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}