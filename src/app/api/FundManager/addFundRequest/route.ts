import { NextResponse, type NextRequest } from "next/server";
import axios from "axios";
import { createBackendClient } from "@/lib/backend-client";
import { getServerEnv } from "@/lib/env";
import { isTokenExpired } from "@/lib/jwt";
import { unauthorizedSessionResponse } from "@/lib/session-response";

type AddFundRequestBody = {
  paymentMode: string;
  amount: number;
  refrenceNo: string;
  depositDetails: string;
  remark: string;
};

function isAddFundRequestBody(value: unknown): value is AddFundRequestBody {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const body = value as Record<string, unknown>;
  return (
    typeof body.paymentMode === "string" &&
    body.paymentMode.trim().length > 0 &&
    typeof body.amount === "number" &&
    Number.isFinite(body.amount) &&
    body.amount > 0 &&
    typeof body.refrenceNo === "string" &&
    body.refrenceNo.trim().length > 0 &&
    typeof body.depositDetails === "string" &&
    body.depositDetails.trim().length > 0 &&
    typeof body.remark === "string"
  );
}

export async function POST(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return unauthorizedSessionResponse(SESSION_COOKIE_NAME, "Not authenticated");
  }

  try {
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
    const token = sessionData.accessToken;

    if (typeof token !== "string" || !token || isTokenExpired(token)) {
      return unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "Session expired or invalid. Please login again.",
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

    if (!isAddFundRequestBody(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "paymentMode, amount, refrenceNo, depositDetails and remark are required.",
        },
        { status: 400 },
      );
    }

    const { data } = await createBackendClient(token).post("/FundManager/addFundRequest", {
      paymentMode: body.paymentMode.trim(),
      amount: body.amount,
      refrenceNo: body.refrenceNo.trim(),
      depositDetails: body.depositDetails.trim(),
      remark: body.remark.trim(),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Add fiat fund request error:", error);

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
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit fiat deposit request.",
      },
      { status: 502 },
    );
  }
}
