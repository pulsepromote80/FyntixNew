import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

// ============================================
// Types
// ============================================
interface UpdateUserProfilePayload {
  LoginID: string;
  FName: string;
  LName: string;
  Address: string;
  Email: string;
  mobile: string;
  countryid: number;
  WalletBep20: string;
}
// ============================================
// Helpers
// ============================================
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUpdateUserPayload(value: unknown): value is UpdateUserProfilePayload {
  return (
    isRecord(value) &&
    typeof value.LoginID === "string" &&
    typeof value.FName === "string" &&
    typeof value.LName === "string" &&
    typeof value.Address === "string" &&
    typeof value.Email === "string" &&
    typeof value.mobile === "string" &&
    typeof value.countryid === "number" &&
    typeof value.WalletBep20 === "string"
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

  // 2. Validate
  if (!isUpdateUserPayload(body)) {
    return NextResponse.json(
      { message: "All update fields must be valid types" },
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
    const { data } = await backend.post(
      "/AdminManageUser/updateUserProfileAdmin",
      body
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin update user error:", error);
    return buildErrorResponse(error, "Failed to update user profile");
  }
}
export async function GET(request: NextRequest) {
  // 1. Query param nikalo
  const { searchParams } = new URL(request.url);
  const authLogin = searchParams.get("authLogin");

  if (!authLogin || !authLogin.trim()) {
    return NextResponse.json(
      { message: "authLogin query parameter is required" },
      { status: 400 }
    );
  }

  // 2. Session se token lo
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // 3. Backend call
  try {
    const backend = createBackendClient(token);
    const { data } = await backend.get(
      `/AdminManageUser/userNameByLoginIdAdmin?authLogin=${encodeURIComponent(
        authLogin.trim()
      )}`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin user by authLogin error:", error);
    return buildErrorResponse(error, "Failed to fetch user");
  }
}