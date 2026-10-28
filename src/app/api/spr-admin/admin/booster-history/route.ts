import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

interface BoosterHistoryPayload {
  AuthLogin: string;
  FromDate: string;
  ToDate: string;
  BoosterType: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTokenFromRequest(request: NextRequest): string | null {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const session: unknown = JSON.parse(sessionCookie);
    const token = isRecord(session) ? session.token : undefined;
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

function isBoosterHistoryPayload(value: unknown): value is BoosterHistoryPayload {
  return (
    isRecord(value) &&
    typeof value.AuthLogin === "string" &&
    typeof value.FromDate === "string" &&
    typeof value.ToDate === "string" &&
    typeof value.BoosterType === "number" &&
    Number.isInteger(value.BoosterType) &&
    value.BoosterType >= 0
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required" }, { status: 400 });
  }

  if (!isBoosterHistoryPayload(body)) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const backend = createBackendClient(token);
    const { data } = await backend.post("/AdminManageFund/getAllUserbooster_Admin", {
      AuthLogin: body.AuthLogin.trim(),
      FromDate: body.FromDate,
      ToDate: body.ToDate,
      BoosterType: body.BoosterType,
    });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Booster history fetch error:", error);

    const response = isRecord(error) && isRecord(error.response) ? error.response : undefined;
    const responseData = response && isRecord(response.data) ? response.data : undefined;
    const message =
      responseData && typeof responseData.message === "string"
        ? responseData.message
        : "Failed to fetch booster history";
    const status =
      response &&
      typeof response.status === "number" &&
      response.status >= 400 &&
      response.status < 500
        ? response.status
        : 502;

    return NextResponse.json({ message }, { status });
  }
}
