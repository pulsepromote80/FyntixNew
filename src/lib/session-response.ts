import { NextResponse } from "next/server";

export function unauthorizedSessionResponse(
  cookieName: string,
  message: string,
) {
  const response = NextResponse.json(
    { success: false, message },
    { status: 401 },
  );

  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
