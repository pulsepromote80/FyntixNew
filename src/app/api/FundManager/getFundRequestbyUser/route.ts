import { NextResponse, type NextRequest } from "next/server";
import axios from "axios";
import { createBackendClient } from "@/lib/backend-client";
import { getServerEnv } from "@/lib/env";
import { isTokenExpired } from "@/lib/jwt";
import { unauthorizedSessionResponse } from "@/lib/session-response";

export async function GET(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return unauthorizedSessionResponse(SESSION_COOKIE_NAME, "Not authenticated");
  }

  try {
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
    const token = sessionData.accessToken;

    if (typeof token !== "string" || !token || isTokenExpired(token)) {
      return unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "Session expired or invalid. Please login again.",
      );
    }

    const { data } = await createBackendClient(token).get("/FundManager/getFundRequestbyUser");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fund request history fetch error:", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "Session expired or invalid. Please login again.",
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch fiat deposit transaction history",
      },
      { status: 500 },
    );
  }
}
