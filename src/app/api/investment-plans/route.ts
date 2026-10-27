import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createBackendClient } from "@/lib/backend-client";
import { unauthorizedSessionResponse } from "@/lib/session-response";
import axios from "axios";

export async function GET(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const Type = searchParams.get('Type');

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

    const backend = createBackendClient(token);
    const { data } = await backend.get("/FundManager/getAllInvestmentProduct", {
      params: Type ? { Type: parseInt(Type, 10) } : undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Investment product fetch error:", error);
    if (axios.isAxiosError(error)) {
      // If 401, token is invalid
      if (error.response?.status === 401) {
        return unauthorizedSessionResponse(
          SESSION_COOKIE_NAME,
          "Session expired or invalid. Please login again.",
        );
      }
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch investment products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
