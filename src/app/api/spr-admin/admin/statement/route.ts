import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

// ============================================
// Helpers
// ============================================
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function getTokenFromRequest(request: NextRequest): string | null {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const session: unknown = JSON.parse(cookie);
    const token = isRecord(session) ? session.token : undefined;
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

function buildErrorResponse(error: unknown, fallback: string) {
  const responseData =
    isRecord(error) && isRecord(error.response) ? error.response.data : undefined;

  const backendStatus =
    isRecord(error) &&
    isRecord(error.response) &&
    typeof error.response.status === "number"
      ? error.response.status
      : 502;

  // 404 — endpoint not found
  if (backendStatus === 404) {
    return NextResponse.json(
      {
        message: "Backend endpoint not found. Check BACKEND_API_URL and path.",
      },
      { status: 404 }
    );
  }

  const message =
    isRecord(responseData) && typeof responseData.message === "string"
      ? responseData.message
      : fallback;

  const status =
    backendStatus >= 400 && backendStatus < 500 ? backendStatus : 502;

  return NextResponse.json({ message }, { status });
}

// ============================================
// POST /api/admin/statement
// → Backend: POST /AdminMaster/getAccStatemtnt
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

  // 2. Record check (AuthLogin empty allowed)
  if (!isRecord(body)) {
    return NextResponse.json(
      { message: "A valid JSON object body is required" },
      { status: 400 }
    );
  }

  // 3. Session token
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // 4. Backend call
  try {
    const backend = createBackendClient(token);
    const { data } = await backend.post("/AdminManageUser/getAccStatemtnt", body);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Account statement error:", error);

    // Debug: actual backend URL + payload print karo
    if (isRecord(error) && isRecord(error.config)) {
      const cfg = error.config as Record<string, unknown>;
      console.error("🌐 Backend URL:", `${cfg.baseURL ?? ""}${cfg.url ?? ""}`);
      console.error("📦 Payload:", cfg.data);
    }

    return buildErrorResponse(error, "Failed to fetch account statement");
  }
}