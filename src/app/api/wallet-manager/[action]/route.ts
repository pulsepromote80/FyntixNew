import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/lib/backend-client";
import { getServerEnv } from "@/lib/env";
import { isTokenExpired } from "@/lib/jwt";
import { unauthorizedSessionResponse } from "@/lib/session-response";

const walletActions = {
  deposit: {
    path: "/WalletReport/getDepositWalletStatement",
    needsTransactionType: true,
  },
  performance: {
    path: "/WalletReport/getIncomeWalletStatement",
    needsTransactionType: true,
  },
  yield: {
    path: "/WalletReport/getRentWalletStatement",
    needsTransactionType: true,
  },
  legacy: {
    path: "/WalletReport/getRentWalletStatement",
    needsTransactionType: true,
  },
  rank: {
    path: "/WalletReport/getRewardStatus",
    needsTransactionType: false,
  },
  income: {
    path: "/WalletReport/getTransactionIncomeHistory",
    needsTransactionType: true,
  },
} as const;

type WalletAction = keyof typeof walletActions;

function isWalletAction(value: string): value is WalletAction {
  return Object.hasOwn(walletActions, value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return unauthorizedSessionResponse(SESSION_COOKIE_NAME, "Not authenticated");
  }

  const { action: actionName } = await context.params;
  if (!isWalletAction(actionName)) {
    return NextResponse.json(
      { success: false, message: "Unknown wallet report." },
      { status: 404 },
    );
  }

  try {
    const session: unknown = JSON.parse(decodeURIComponent(sessionCookie));
    const token = isRecord(session) ? session.accessToken : undefined;
    if (typeof token !== "string" || !token || isTokenExpired(token)) {
      return unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "Session expired or invalid. Please login again.",
      );
    }

    const action = walletActions[actionName];
    const backend = createBackendClient(token);

    const { data } = await backend.get(action.path, {
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error(`Wallet report request failed (${actionName}):`, error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return unauthorizedSessionResponse(
          SESSION_COOKIE_NAME,
          "Session expired or invalid. Please login again.",
        );
      }
      if (error.response) {
        return NextResponse.json(error.response.data, {
          status: error.response.status,
          headers: { "Cache-Control": "no-store, max-age=0" },
        });
      }
    }

    return NextResponse.json(
      { success: false, message: "Wallet report request failed." },
      { status: 502, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return unauthorizedSessionResponse(SESSION_COOKIE_NAME, "Not authenticated");
  }

  const { action: actionName } = await context.params;
  if (!isWalletAction(actionName)) {
    return NextResponse.json(
      { success: false, message: "Unknown wallet report." },
      { status: 404 },
    );
  }

  try {
    const session: unknown = JSON.parse(decodeURIComponent(sessionCookie));
    const token = isRecord(session) ? session.accessToken : undefined;
    if (typeof token !== "string" || !token || isTokenExpired(token)) {
      return unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "Session expired or invalid. Please login again.",
      );
    }

    const action = walletActions[actionName];
    const backend = createBackendClient(token);
    const body: Record<string, unknown> = {};

    if (action.needsTransactionType) {
      let transactionType = "";
      if (request.headers.get("content-type")?.includes("application/json")) {
        const input: unknown = await request.json();
        if (isRecord(input) && typeof input.transtype === "string") {
          transactionType = input.transtype;
        }
      }
      body.transtype = transactionType;
    }

    if (["performance", "yield", "legacy"].includes(actionName)) {
      // Velvora's report requests send a null URID and let the authenticated token scope the report.
      body.urid = null;
    }

    const { data } = await backend.post(
      action.path,
      Object.keys(body).length > 0 ? body : undefined,
      { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } },
    );
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error(`Wallet report request failed (${actionName}):`, error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return unauthorizedSessionResponse(
          SESSION_COOKIE_NAME,
          "Session expired or invalid. Please login again.",
        );
      }
      if (error.response) {
        return NextResponse.json(error.response.data, {
          status: error.response.status,
          headers: { "Cache-Control": "no-store, max-age=0" },
        });
      }
    }

    return NextResponse.json(
      { success: false, message: "Wallet report request failed." },
      { status: 502, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
