import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";


export async function GET(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(
    { success: false, message: "Backend integration not implemented yet" },
    { status: 501 },
  );
}

export async function POST(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(
    { success: false, message: "Backend integration not implemented yet" },
    { status: 501 },
  );
}
