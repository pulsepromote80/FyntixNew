import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { isTokenExpired } from "@/lib/jwt";
import axios from "axios";

/**
 * GET /api/Authentication/getAllTransactionLog
 * Fetches transaction log data from https://tradeppips.com/api/Authentication/getAllTransactionLog
 */
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
      return NextResponse.json({ success: false, message: "No token in session" }, { status: 401 });
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      return NextResponse.json(
        { success: false, message: "Token expired. Please login again." },
        { status: 401 }
      );
    }

    // Fetch transaction log data directly from https://tradeppips.com
    const { data } = await axios.get("https://tradeppips.com/api/Authentication/getAllTransactionLog", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Transaction log error:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return NextResponse.json(
          { success: false, message: "Session expired or invalid. Please login again." },
          { status: 401 },
        );
      }
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transaction log data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
