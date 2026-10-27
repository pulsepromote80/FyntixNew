import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createBackendClient } from "@/lib/backend-client";
import { isTokenExpired } from "@/lib/jwt";
import axios from "axios";

export async function POST(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    const decodedCookie = decodeURIComponent(sessionCookie);
    const sessionData = JSON.parse(decodedCookie);
    const token = sessionData.accessToken;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token in session" }, { status: 401 });
    }

    if (isTokenExpired(token)) {
      return NextResponse.json(
        { success: false, message: "Token expired. Please login again." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const payload = {
      code: body.code || "",
    };

    const backend = createBackendClient(token);
    const { data } = await backend.post("/TwoFacAuth/generateUser", payload);

    return NextResponse.json({
      success: true,
      data: data,
      message: data.message || "QR code generated successfully",
    });
  } catch (error) {
    console.error("Generate 2FA error:", error);
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
          message: error.response?.data?.message || "Failed to generate QR code",
        },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate QR code",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
