import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required" }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    typeof body.authLogin !== "string" ||
    typeof body.fromDate !== "string" ||
    typeof body.toDate !== "string"
  ) {
    return NextResponse.json(
      { message: "authLogin, fromDate, and toDate must be strings" },
      { status: 400 },
    );
  }

  try {
    const backend = createBackendClient(token);
    const { data } = await backend.post(
      "/AdminManageFund/getAllROIWithdrawalReport_Admin",
      body,
    );
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("ROI withdrawal report fetch error:", error);

    const response =
      isRecord(error) && isRecord(error.response) ? error.response : undefined;
    const responseData = response && isRecord(response.data) ? response.data : undefined;
    if (
      (response?.status === 404 || responseData?.statusCode === 404) &&
      (responseData?.data === null ||
        (typeof responseData?.message === "string" &&
          responseData.message.toLowerCase() === "no data found"))
    ) {
      return NextResponse.json({ unApWithROI: [], aprWithROI: [] });
    }

    const message =
      responseData && typeof responseData.message === "string"
        ? responseData.message
        : "Failed to fetch ROI withdrawal report";
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
