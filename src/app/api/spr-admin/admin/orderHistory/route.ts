import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

// ============================================
// Types
// ============================================
interface OrderHistoryPayload {
  AuthLogin: string;
  Statusid: string;
  FromDate: string;
  ToDate: string;
}

// ============================================
// Helpers
// ============================================
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOrderHistoryPayload(value: unknown): value is OrderHistoryPayload {
  return (
    isRecord(value) &&
    typeof value.AuthLogin === "string" &&
    typeof value.Statusid === "string" &&
    typeof value.FromDate === "string" &&
    typeof value.ToDate === "string"
  );
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

function buildErrorResponse(error: unknown, fallbackMessage: string) {
  const responseData =
    isRecord(error) && isRecord(error.response) ? error.response.data : undefined;

  const message =
    isRecord(responseData) && typeof responseData.message === "string"
      ? responseData.message
      : fallbackMessage;

  const backendStatus =
    isRecord(error) &&
    isRecord(error.response) &&
    typeof error.response.status === "number" &&
    error.response.status >= 400 &&
    error.response.status < 500
      ? error.response.status
      : 502;

  return NextResponse.json({ message }, { status: backendStatus });
}

// ============================================
// POST — Get Order History
// ============================================
export async function POST(request: NextRequest) {
  // 1. Body parse
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "A valid JSON body is required" },
      { status: 400 }
    );
  }

  // 2. Validate — AuthLogin mandatory, baaki optional (empty string allowed)
  if (!isOrderHistoryPayload(body)) {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

//   if (!body.AuthLogin.trim()) {
//     return NextResponse.json(
//       { message: "AuthLogin is required" },
//       { status: 400 }
//     );
//   }

  // 3. Session token
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // 4. Backend call
  try {
    const backend = createBackendClient(token);
    const { data } = await backend.post(
      "/AdminManageUser/getOrderHistory",
      {
        AuthLogin: body.AuthLogin.trim(),
        Statusid: body.Statusid ?? "",
        FromDate: body.FromDate ?? "",
        ToDate: body.ToDate ?? "",
      }
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin order history error:", error);
    return buildErrorResponse(error, "Failed to fetch order history");
  }
}