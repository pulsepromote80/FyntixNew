import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

/**
 * POST /api/auth/logout
 * Clears the HttpOnly session cookie. Optionally notify the backend to
 * revoke the token server-side once that endpoint exists.
 */
export async function POST() {
  const { SESSION_COOKIE_NAME } = getServerEnv();

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
