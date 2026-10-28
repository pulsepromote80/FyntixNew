import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

interface SearchAllUsersPayload {
  AuthLogin: string;
  Fname: string;
  Active: string;
  Mobile: string;
  Email: string;
  Kid: string;
  Walletid: string;
  FromDate: string;
  ToDate: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSearchPayload(value: unknown): value is SearchAllUsersPayload {
  return (
    isRecord(value) &&
    [
      "AuthLogin",
      "Fname",
      "Active",
      "Mobile",
      "Email",
      "Kid",
      "Walletid",
      "FromDate",
      "ToDate",
    ].every((field) => typeof value[field] === "string")
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required" }, { status: 400 });
  }

  if (!isSearchPayload(body)) {
    return NextResponse.json(
      { message: "All user search fields must be provided as strings" },
      { status: 400 },
    );
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

    const backend = createBackendClient(token);
    const { data } = await backend.post("/AdminManageUser/SearchAllUsers", body);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin user search error:", error);
    const responseData =
      isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    const message =
      isRecord(responseData) && typeof responseData.message === "string"
        ? responseData.message
        : "Failed to search users";
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
}
