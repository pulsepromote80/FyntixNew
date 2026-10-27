import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createBackendClient } from "@/lib/backend-client";
import { isTokenExpired } from "@/lib/jwt";
import axios from "axios";

/**
 * POST /api/auth/change-password
 * Changes the user's password
 */
export async function POST(request: NextRequest) {
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
      return NextResponse.json({ success: false, message: "No token in session" }, { status: 401 });
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      return NextResponse.json(
        { success: false, message: "Token expired. Please login again." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get userId from session or from the user data
    const userId = sessionData.userData?.UserId || body.userid;

    const payload = {
      userid: userId,
      oldPassword: body.oldPassword,
      newPass: body.newPass,
      otp: body.otp,
    };

    // Call backend API to change password
    const backend = createBackendClient(token);
    const { data } = await backend.post("/Authentication/changePassword", payload);

    return NextResponse.json({
      success: true,
      data: data,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return NextResponse.json(
          { success: false, message: "Session expired or invalid. Please login again." },
          { status: 401 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: error.response?.data?.message || "Failed to change password",
        },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to change password",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
