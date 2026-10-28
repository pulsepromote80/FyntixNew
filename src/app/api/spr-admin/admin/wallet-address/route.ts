import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function getErrorResponse(error: unknown, fallback: string) {
  const response = isRecord(error) && isRecord(error.response) ? error.response : undefined;
  const data = response && isRecord(response.data) ? response.data : undefined;
  const status = response && typeof response.status === "number" ? response.status : 502;
  const message =
    data && typeof data.message === "string"
      ? data.message
      : data && typeof data.Message === "string"
        ? data.Message
        : fallback;

  return NextResponse.json({ message }, { status: status >= 400 && status < 500 ? status : 502 });
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ message: "Quantity must be a positive integer." }, { status: 400 });
  }

  const quantity = body.Quantity ?? body.quantity;
  const isGenerateRequest =
    typeof quantity === "number" && Number.isSafeInteger(quantity) && quantity >= 1;

  if (!isGenerateRequest) {
    return NextResponse.json({ message: "Quantity must be a positive integer." }, { status: 400 });
  }

  try {
    const backend = createBackendClient(token);
    const { data } = await backend.post("/Self/GenerateWalletAddress", {
      Quantity: quantity,
    });

    const message = isRecord(data)
      ? typeof data.message === "string"
        ? data.message
        : typeof data.Message === "string"
          ? data.Message
          : undefined
      : undefined;
    const status = isRecord(data) ? (data.status ?? data.Status) : undefined;
    const isSuccessful =
      status === "Succeed" ||
      status === true ||
      (isRecord(data) && (data.success === true || data.Success === true)) ||
      (typeof message === "string" && /\bcreated successfully\b/i.test(message));

    if (!isSuccessful) {
      return NextResponse.json(
        { message: message ?? "Failed to generate wallet addresses." },
        { status: 502 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin wallet address generation request failed:", error);
    return getErrorResponse(error, "Failed to generate wallet addresses.");
  }
}
