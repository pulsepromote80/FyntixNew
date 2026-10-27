import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/lib/backend-client";
import { getServerEnv } from "@/lib/env";
import { isTokenExpired } from "@/lib/jwt";
import { unauthorizedSessionResponse } from "@/lib/session-response";
const unseenNotificationListPath = "/Ticket/getUnseenUserNotificationListbyURID";
const allNotificationListPath = "/Ticket/getAllUserNotificationList";
const markNotificationsReadPath = "/Ticket/updateUserNotification";

async function getBackend(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return {
      response: unauthorizedSessionResponse(SESSION_COOKIE_NAME, "Not authenticated"),
    };
  }

  try {
    const session: unknown = JSON.parse(decodeURIComponent(sessionCookie));
    const token =
      typeof session === "object" && session !== null && "accessToken" in session
        ? session.accessToken
        : undefined;

    if (typeof token !== "string" || !token || isTokenExpired(token)) {
      return {
        response: unauthorizedSessionResponse(
          SESSION_COOKIE_NAME,
          "Session expired or invalid. Please login again.",
        ),
      };
    }

    return { backend: createBackendClient(token) };
  } catch {
    return {
      response: unauthorizedSessionResponse(
        SESSION_COOKIE_NAME,
        "Session expired or invalid. Please login again.",
      ),
    };
  }
}

async function proxyNotificationRequest(
  request: NextRequest,
  endpoint: "unseen" | "all" | "markRead",
) {
  const auth = await getBackend(request);
  if (auth.response) return auth.response;

  try {
    const path =
      endpoint === "all"
        ? allNotificationListPath
        : endpoint === "markRead"
          ? markNotificationsReadPath
          : unseenNotificationListPath;
    const { data } =
      endpoint === "markRead" ? await auth.backend.post(path) : await auth.backend.get(path);
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      endpoint === "markRead"
        ? "Could not mark notifications as read:"
        : "Could not load notifications:",
      error,
    );

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        const { SESSION_COOKIE_NAME } = getServerEnv();
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
      { success: false, message: "Notification request failed." },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get("scope") === "all" ? "all" : "unseen";
  return proxyNotificationRequest(request, endpoint);
}

export async function POST(request: NextRequest) {
  return proxyNotificationRequest(request, "markRead");
}
