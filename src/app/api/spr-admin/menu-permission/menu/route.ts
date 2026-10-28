import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

interface PermissionMenu {
  id: string;
  name: string;
  subMenus: PermissionSubMenu[];
}

interface PermissionSubMenu {
  id: string;
  name: string;
  permission: string | null;
}

interface OrderedPermissionMenu extends PermissionMenu {
  displayOrder: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getDisplayOrder(value: unknown): number {
  return isRecord(value) && typeof value.displayOrder === "number" ? value.displayOrder : 0;
}

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")?.trim();
  if (!username) {
    return NextResponse.json({ message: "Username is required" }, { status: 400 });
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
    const { data } = await backend.get("/Menu/getAllMenuPermission", {
      params: { username },
    });
    const menusPayload = isRecord(data) ? data.data : data;

    if (!Array.isArray(menusPayload)) {
      throw new Error("Menu permission response did not contain a data list");
    }

    const menus = menusPayload
      .filter(isRecord)
      .flatMap((menu): OrderedPermissionMenu[] => {
        if (typeof menu.menuName !== "string" || !menu.menuName) {
          return [];
        }

        const rawSubMenus = Array.isArray(menu.SubMenus)
          ? menu.SubMenus
          : Array.isArray(menu.subMenus)
            ? menu.subMenus
            : [];
        const subMenus = rawSubMenus
          .filter(isRecord)
          .flatMap((subMenu): (PermissionSubMenu & { displayOrder: number })[] => {
            if (typeof subMenu.subMenuName !== "string" || !subMenu.subMenuName) {
              return [];
            }

            const permissionId =
              typeof subMenu.subMenuId === "string" && subMenu.subMenuId
                ? subMenu.subMenuId
                : undefined;

            return [
              {
                id: permissionId ?? subMenu.subMenuName,
                ...(permissionId ? { permissionId } : {}),
                name: subMenu.subMenuName,
                permission:
                  typeof subMenu.Permission === "string"
                    ? subMenu.Permission
                    : typeof subMenu.permission === "string"
                      ? subMenu.permission
                      : null,
                displayOrder: getDisplayOrder(subMenu),
              },
            ];
          })
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(({ displayOrder: _displayOrder, ...subMenu }) => subMenu);

        return [
          {
            id: typeof menu.menuId === "string" && menu.menuId ? menu.menuId : menu.menuName,
            name: menu.menuName,
            displayOrder: getDisplayOrder(menu),
            subMenus,
          },
        ];
      })
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(({ displayOrder: _displayOrder, ...menu }) => menu);

    return NextResponse.json(menus);
  } catch (error) {
    console.error("Menu permissions fetch error:", error);
    return NextResponse.json({ message: "Failed to load menu permissions" }, { status: 502 });
  }
}
