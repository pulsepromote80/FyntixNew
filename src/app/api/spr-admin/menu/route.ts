import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

interface BackendMenuItem {
  menuId: string;
  menuName: string;
  pageName: string;
  menuIcon: string;
  displayOrder: number;
  subMenus?: BackendSubMenu[];
  SubMenus?: BackendSubMenu[];
}

interface BackendSubMenu {
  subMenuId: string;
  subMenuName: string;
  subMenuPageName: string;
  displayOrder: number;
  hasSubMenuPermission: boolean;
}

interface FrontendMenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  children?: FrontendMenuItem[];
}

function getMenuHref(pageName: string, label: string): string {
  const routeName = (pageName || label).toLowerCase().replace(/[^a-z0-9]/g, "");
  const routeAliases: Record<string, string> = {
    incomerequest: "/roi-request",
    roiincomerequest: "/roi-request",
    roirequest: "/roi-request",
    roiwithdrawalrequest: "/roi-request",
    withdrawalrequest: "/withdrawal-request",
  };

  return routeAliases[routeName] ?? `/${pageName.toLowerCase()}`;
}

/**
 * Transform backend menu structure to frontend format
 */
function transformMenuData(backendMenu: BackendMenuItem[]): FrontendMenuItem[] {
  return backendMenu.map((item) => {
    const subMenus = item.SubMenus ?? item.subMenus ?? [];

    return {
      id: item.menuId,
      label: item.menuName,
      href: getMenuHref(item.pageName, item.menuName),
      icon: item.menuIcon,
      children: subMenus.map((subItem) => ({
        id: subItem.subMenuId,
        label: subItem.subMenuName,
        href: getMenuHref(subItem.subMenuPageName, subItem.subMenuName),
        icon: item.menuIcon,
      })),
    };
  });
}

/**
 * GET /api/menu
 *
 * Fetches menu items from the backend using adminUserId from session cookie
 */
export async function GET(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();

  // Get session data from cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return NextResponse.json(
      [],
      { status: 401 },
    );
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    const { token } = sessionData;

    const backend = createBackendClient();
    const { data } = await backend.get(`/Menu/getAllMenu`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 8000, // 8 seconds timeout for menu data
    });


    // Ensure we return an array, handle different response structures
    const menuData = Array.isArray(data) ? data : (data?.data || []);

    // Transform backend data to frontend format
    const transformedMenu = transformMenuData(menuData as BackendMenuItem[]);

    return NextResponse.json(transformedMenu, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error("Menu fetch error:", error);
    return NextResponse.json(
      [],
      { status: 500 },
    );
  }
}
