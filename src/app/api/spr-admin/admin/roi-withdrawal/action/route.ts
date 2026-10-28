import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { rateLimit, getClientIp } from "@/spr-admin/lib/rate-limiter";

type RoiStatusPayload = {
  action: "approve" | "reject";
  id: number;
  authLoginId: string;
  rfstatus: 1 | 2;
  remark: string;
};

type RoiUsdtPayload = {
  action: "usdt-transfer";
  authLoginId: string;
  debit: number;
  wallet: string;
  transHash: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStatusPayload(value: unknown): value is RoiStatusPayload {
  return (
    isRecord(value) &&
    (value.action === "approve" || value.action === "reject") &&
    Number.isInteger(value.id) &&
    Number(value.id) > 0 &&
    typeof value.authLoginId === "string" &&
    value.authLoginId.trim().length > 0 &&
    (value.rfstatus === 1 || value.rfstatus === 2) &&
    value.rfstatus === (value.action === "approve" ? 1 : 2) &&
    typeof value.remark === "string" &&
    value.remark.trim().length > 0
  );
}

function isUsdtPayload(value: unknown): value is RoiUsdtPayload {
  return (
    isRecord(value) &&
    value.action === "usdt-transfer" &&
    typeof value.authLoginId === "string" &&
    value.authLoginId.trim().length > 0 &&
    typeof value.debit === "number" &&
    Number.isFinite(value.debit) &&
    value.debit > 0 &&
    typeof value.wallet === "string" &&
    /^0x[a-fA-F0-9]{40}$/.test(value.wallet) &&
    typeof value.transHash === "string" &&
    /^0x[a-fA-F0-9]{64}$/.test(value.transHash)
  );
}

function getErrorResponse(error: unknown): { status: number; message: string } {
  if (isRecord(error) && isRecord(error.response)) {
    const responseData = isRecord(error.response.data)
      ? error.response.data
      : undefined;
    const status =
      typeof error.response.status === "number" &&
      error.response.status >= 400 &&
      error.response.status < 500
        ? error.response.status
        : 502;
    const message =
      responseData && typeof responseData.message === "string"
        ? responseData.message
        : "Failed to process ROI withdrawal request.";
    return { status, message };
  }
  return { status: 502, message: "Failed to process ROI withdrawal request." };
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

  // Rate limiting: 15 requests per minute per IP (financial endpoint)
  const ip = getClientIp(request);
  const limiter = rateLimit({ limit: 15, windowMs: 60 * 1000 });
  const rateLimitResult = await limiter(`${ip}:roi-withdrawal-action`);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        message: "Too many requests. Please slow down.",
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': '15',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimitResult.resetTime),
        },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required." }, { status: 400 });
  }
  if (!isStatusPayload(payload) && !isUsdtPayload(payload)) {
    return NextResponse.json({ message: "Invalid ROI withdrawal action payload." }, { status: 400 });
  }

  try {
    const backend = createBackendClient(token);
    let endpoint: string;
    let backendPayload: Record<string, string | number>;
    if (payload.action === "usdt-transfer") {
      endpoint = "/AdminManageFund/updateRoiWalletAdress";
      backendPayload = {
        authLoginId: payload.authLoginId,
        debit: payload.debit,
        wallet: payload.wallet,
        transHash: payload.transHash,
      };
    } else {
      endpoint = "/AdminManageFund/upROIWithdReqStatus_Admin";
      backendPayload = {
        authLoginId: payload.authLoginId,
        id: payload.id,
        rfstatus: payload.rfstatus,
        remark: payload.remark.trim(),
      };
    }

    const { data } = await backend.post(endpoint, backendPayload);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("ROI withdrawal action failed:", error);
    const { status, message } = getErrorResponse(error);
    return NextResponse.json({ message }, { status });
  }
}
