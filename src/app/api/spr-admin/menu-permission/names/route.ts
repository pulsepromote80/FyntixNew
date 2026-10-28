import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const session: unknown = JSON.parse(sessionCookie);
    const token = isRecord(session) ? session.token : undefined;
    if (typeof token !== "string" || !token) {
      return NextResponse.json(
        { message: "Invalid session" },
        { status: 401 },
      );
    }

    const backend = createBackendClient(token);
    const { data } = await backend.get("/Menu/getpermissonName");
    const namesPayload = isRecord(data) ? data.data : data;

    if (!Array.isArray(namesPayload)) {
      throw new Error("Permission name response did not contain a data list");
    }

    const names = namesPayload
      .filter(isRecord)
      .map((item) => item.Name ?? item.name)
      .filter((name): name is string => typeof name === "string" && name.length > 0);

    return NextResponse.json(names);
  } catch (error) {
    console.error("Permission names fetch error:", error);
    return NextResponse.json(
      { message: "Failed to load admin names" },
      { status: 502 },
    );
  }
}
