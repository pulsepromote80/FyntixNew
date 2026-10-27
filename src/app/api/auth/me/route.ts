import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { isTokenExpired } from "@/lib/jwt";
import { unauthorizedSessionResponse } from "@/lib/session-response";

export async function GET(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    // Decode URL-encoded cookie value
    const decodedCookie = decodeURIComponent(sessionCookie);
    const sessionData = JSON.parse(decodedCookie);
    const token = sessionData.accessToken;

    if (!token) {
      return unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "No token in session",
      );
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      return unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "Token expired. Please login again.",
      );
    }

    return NextResponse.json({
      success: true,
      data: sessionData.userData ?? null,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return unauthorizedSessionResponse(
      SESSION_COOKIE_NAME,
      "Session is invalid. Please login again.",
    );
  }
}
