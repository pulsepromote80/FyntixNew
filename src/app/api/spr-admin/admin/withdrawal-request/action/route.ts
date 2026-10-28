import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { rateLimit, getClientIp } from "@/spr-admin/lib/rate-limiter";

type WithdrawalActionPayload = {
  action: "approve" | "reject";
  id: number;
  authLoginId: string;
  rfstatus: 1 | 2;
  remark: string;
};

type UsdtTransferPayload = {
  action: "usdt-transfer";
  AuthLoginId: string;
  debit: number;
  Wallet: string;
  TransHash: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStatus(error: unknown): number {
  if (!isRecord(error) || !isRecord(error.response)) return 502;
  const status = error.response.status;
  return typeof status === "number" && status >= 400 && status < 500
    ? status
    : 502;
}

function getMessage(error: unknown): string {
  if (
    isRecord(error) &&
    isRecord(error.response) &&
    isRecord(error.response.data) &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return "Failed to process withdrawal request.";
}

function isWithdrawalAction(value: unknown): value is WithdrawalActionPayload {
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

function isUsdtTransfer(value: unknown): value is UsdtTransferPayload {
  return (
    isRecord(value) &&
    value.action === "usdt-transfer" &&
    typeof value.AuthLoginId === "string" &&
    value.AuthLoginId.trim().length > 0 &&
    typeof value.debit === "number" &&
    Number.isFinite(value.debit) &&
    value.debit > 0 &&
    typeof value.Wallet === "string" &&
    /^0x[a-fA-F0-9]{40}$/.test(value.Wallet) &&
    typeof value.TransHash === "string" &&
    /^0x[a-fA-F0-9]{64}$/.test(value.TransHash)
  );
}

function isValidWithdrawalPayload(
  value: unknown,
): value is WithdrawalActionPayload | UsdtTransferPayload {
  return isWithdrawalAction(value) || isUsdtTransfer(value);
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
    token =
      isRecord(session) && typeof session.token === "string"
        ? session.token
        : undefined;
  } catch {
    return NextResponse.json({ message: "Invalid session" }, { status: 401 });
  }
  if (typeof token !== "string" || !token) {
    return NextResponse.json({ message: "Invalid session" }, { status: 401 });
  }

  // Rate limiting: 15 requests per minute per IP (financial endpoint)
  const ip = getClientIp(request);
  const limiter = rateLimit({ limit: 15, windowMs: 60 * 1000 });
  const rateLimitResult = await limiter(`${ip}:withdrawal-action`);

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
    return NextResponse.json(
      { message: "A valid JSON body is required." },
      { status: 400 },
    );
  }

  if (!isValidWithdrawalPayload(payload)) {
    return NextResponse.json(
      { message: "Invalid withdrawal action payload." },
      { status: 400 },
    );
  }

  try {
    const backend = createBackendClient(token);
    let endpoint: string;
    let backendPayload: Record<string, string | number>;
    if (payload.action === "usdt-transfer") {
      endpoint = "/AdminManageFund/updateIncomeWalletAdress";
      backendPayload = {
        AuthLoginId: payload.AuthLoginId,
        debit: payload.debit,
        Wallet: payload.Wallet,
        TransHash: payload.TransHash,
      };
    } else {
      endpoint = "/AdminManageFund/UpIncomeWithdReqStatus_Admin";
      backendPayload = {
          id: payload.id,
          authLoginId: payload.authLoginId,
          rfstatus: payload.rfstatus,
          remark: payload.remark.trim(),
      };
    }
    const { data } = await backend.post(endpoint, backendPayload);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Withdrawal request action failed:", error);
    return NextResponse.json(
      { message: getMessage(error) },
      { status: getStatus(error) },
    );
  }
}
