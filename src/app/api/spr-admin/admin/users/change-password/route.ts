import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";

interface ChangeUserPasswordPayload {
  LoginId: string;
  OldPassword: string;
  NewPass: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isChangePasswordPayload(value: unknown): value is ChangeUserPasswordPayload {
  return (
    isRecord(value) &&
    typeof value.LoginId === "string" &&
    Boolean(value.LoginId.trim()) &&
    typeof value.OldPassword === "string" &&
    value.OldPassword.length > 0 &&
    typeof value.NewPass === "string" &&
    value.NewPass.length >= 8
  );
}

function getErrorMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (!isRecord(value)) {
    return null;
  }
  for (const key of ["message", "detail", "title", "Message", "Detail", "Title"]) {
    const message = value[key];
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return null;
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required" }, { status: 400 });
  }

  if (!isChangePasswordPayload(body)) {
    return NextResponse.json(
      {
        message:
          "Enter a login ID and current password, and make sure the new password is at least 8 characters.",
      },
      { status: 400 },
    );
  }

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

  try {
    const backend = createBackendClient(token);
    const { data } = await backend.post(
      "/AdminAuthentication/changeAdminUserPassword",
      {
        ...body,
        LoginId: body.LoginId.trim(),
      },
    );
    return NextResponse.json(data ?? null);
  } catch (error) {
    console.error("Admin change user password error:", error);
    const responseData =
      isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    return NextResponse.json(
      { message: getErrorMessage(responseData) ?? "Failed to change user password" },
      { status: getBackendStatus(error) },
    );
  }
}
