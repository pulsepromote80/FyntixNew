import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

interface DeleteMenuPermissionBody {
  SubmenuId: string[];
  UserName: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getMessage(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return typeof value === "string" && value.trim() ? value : undefined;
  }

  for (const key of ["message", "Message", "title", "Title"]) {
    if (typeof value[key] === "string" && value[key].trim()) {
      return value[key];
    }
  }

  return undefined;
}

function getErrorStatus(status: unknown, fallback: number): number {
  return typeof status === "number" && Number.isInteger(status) && status >= 400 && status <= 599
    ? status
    : fallback;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required" }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    !Array.isArray(body.SubmenuId) ||
    body.SubmenuId.length === 0 ||
    !body.SubmenuId.every((id) => typeof id === "string" && id.trim()) ||
    typeof body.UserName !== "string" ||
    !body.UserName.trim()
  ) {
    return NextResponse.json({ message: "SubmenuId and UserName are required" }, { status: 400 });
  }

  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const session: unknown = JSON.parse(sessionCookie);
    const token = isRecord(session) ? session.token : undefined;

    if (typeof token !== "string" || !token) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const payload: DeleteMenuPermissionBody = {
      SubmenuId: body.SubmenuId.map((id) => id.trim()),
      UserName: body.UserName.trim(),
    };
    const backend = createBackendClient(token);
    const { data } = await backend.post("/Menu/deleteMenuPermision", payload);

    if (
      isRecord(data) &&
      (data.success === false || (typeof data.statusCode === "number" && data.statusCode >= 400))
    ) {
      const message = getMessage(data) ?? "Failed to delete menu permission";
      const status = getErrorStatus(data.statusCode, 502);
      return NextResponse.json({ message }, { status });
    }

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    const upstreamStatus = axios.isAxiosError(error) ? error.response?.status : undefined;
    const responseData = axios.isAxiosError(error) ? error.response?.data : undefined;
    const responseStatusCode =
      isRecord(responseData) && typeof responseData.statusCode === "number"
        ? responseData.statusCode
        : undefined;
    const message = getMessage(responseData) ?? "Failed to delete menu permission";
    const status = getErrorStatus(upstreamStatus, getErrorStatus(responseStatusCode, 502));
    console.error("Menu permission deletion failed:", {
      message: axios.isAxiosError(error) ? error.message : "Unexpected backend error",
      status,
    });

    return NextResponse.json({ message }, { status });
  }
}
