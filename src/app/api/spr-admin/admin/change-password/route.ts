import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";

interface ChangeAdminPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPayload(value: unknown): value is ChangeAdminPasswordPayload {
  return (
    isRecord(value) &&
    typeof value.currentPassword === "string" &&
    value.currentPassword.length > 0 &&
    typeof value.newPassword === "string" &&
    value.newPassword.length >= 8 &&
    /[A-Z]/.test(value.newPassword) &&
    /[a-z]/.test(value.newPassword) &&
    /[0-9]/.test(value.newPassword) &&
    /[^A-Za-z0-9]/.test(value.newPassword) &&
    value.newPassword !== value.currentPassword
  );
}

function getErrorMessage(value: unknown): string {
  if (!isRecord(value)) return "Failed to change admin password.";
  for (const key of ["message", "detail", "title", "Message", "Detail", "Title"]) {
    const message = value[key];
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Failed to change admin password.";
}

function getBackendStatus(error: unknown): number {
  if (
    isRecord(error) &&
    isRecord(error.response) &&
    typeof error.response.status === "number" &&
    error.response.status >= 400 &&
    error.response.status < 500
  ) {
    return error.response.status;
  }
  return 502;
}

export async function POST(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let session: unknown;
  try {
    session = JSON.parse(sessionCookie);
  } catch {
    return NextResponse.json({ message: "Invalid session." }, { status: 401 });
  }

  const token = isRecord(session) ? session.token : undefined;
  const userData = isRecord(session) ? session.userData : undefined;
  const loginId = isRecord(userData) ? (userData.loginId ?? userData.email) : undefined;
  if (typeof token !== "string" || !token || typeof loginId !== "string" || !loginId.trim()) {
    return NextResponse.json(
      { message: "Admin login details are unavailable. Sign in again and retry." },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required." }, { status: 400 });
  }

  if (!isPayload(payload)) {
    return NextResponse.json(
      { message: "Enter a valid current password and a strong new password." },
      { status: 400 },
    );
  }

  try {
    const backend = createBackendClient(token);
    const { data } = await backend.post("/AdminMaster/chanegAdminPassword", {
      username: loginId.trim(),
      oldPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });

    if (
      isRecord(data) &&
      (data.success === false ||
        data.status === false ||
        (typeof data.statusCode === "number" && data.statusCode >= 400))
    ) {
      const statusCode =
        typeof data.statusCode === "number" && data.statusCode >= 400 && data.statusCode < 600
          ? data.statusCode
          : 400;
      return NextResponse.json({ message: getErrorMessage(data) }, { status: statusCode });
    }

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error("Admin password change failed:", error);
    const responseData =
      isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    return NextResponse.json(
      { message: getErrorMessage(responseData) },
      { status: getBackendStatus(error) },
    );
  }
}
