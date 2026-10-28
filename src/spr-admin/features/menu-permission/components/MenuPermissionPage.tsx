"use client";

import { useState } from "react";
import axios from "axios";
import {
  Check,
  KeyRound,
  ListFilter,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useMenuPermissions } from "@/spr-admin/features/menu-permission/hooks/useMenuPermissions";
import { usePermissionNames } from "@/spr-admin/features/menu-permission/hooks/usePermissionNames";
import { useAddMenuPermission } from "@/spr-admin/features/menu-permission/hooks/useAddMenuPermission";
import { useDeleteMenuPermission } from "@/spr-admin/features/menu-permission/hooks/useDeleteMenuPermission";
import { Spinner } from "@/spr-admin/components/ui/Spinner";
import { ConfirmDialog } from "@/spr-admin/components/common/ConfirmDialog";

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {message}
    </p>
  );
}

function getRequestErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") {
      return message;
    }
  }

  return error instanceof Error ? error.message : "Failed to update menu permission.";
}

export function MenuPermissionPage() {
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [permissionToDelete, setPermissionToDelete] = useState<{
    submenuIds: string[];
    submenuNames: string[];
    username: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSubmenuIds, setSelectedSubmenuIds] = useState<Set<string>>(() => new Set());
  const [selectedDeleteSubmenuIds, setSelectedDeleteSubmenuIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedAllSubmenus, setSelectedAllSubmenus] = useState(false);
  const namesQuery = usePermissionNames();
  const menusQuery = useMenuPermissions(selectedUsername);
  const addPermissionMutation = useAddMenuPermission();
  const deletePermissionMutation = useDeleteMenuPermission();
  const confirmDeletePermission = () => {
    if (!permissionToDelete) {
      return;
    }

    deletePermissionMutation.mutate(
      {
        SubmenuId: permissionToDelete.submenuIds,
        UserName: permissionToDelete.username,
      },
      {
        onSuccess: () => {
          if (selectedUsername === permissionToDelete.username) {
            setSelectedSubmenuIds((current) => {
              const updated = new Set(current);
              permissionToDelete.submenuIds.forEach((id) => updated.delete(id));
              return updated;
            });
          }
          setSelectedDeleteSubmenuIds((current) => {
            const updated = new Set(current);
            permissionToDelete.submenuIds.forEach((id) => updated.delete(id));
            return updated;
          });
          setPermissionToDelete(null);
        },
      },
    );
  };
  const filteredNames = (namesQuery.data ?? []).filter((name) =>
    name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const permissionMenus = menusQuery.data ?? [];
  const deletableSubmenus = permissionMenus.flatMap((menu) =>
    menu.subMenus.filter((subMenu) => Boolean(subMenu.permissionId)),
  );
  const selectedDeletableSubmenus = deletableSubmenus.filter(
    (subMenu) => subMenu.permissionId && selectedDeleteSubmenuIds.has(subMenu.permissionId),
  );
  const allDeletableSubmenusSelected =
    deletableSubmenus.length > 0 && selectedDeletableSubmenus.length === deletableSubmenus.length;
  const grantableSubmenus = permissionMenus.flatMap((menu) =>
    menu.subMenus.filter(
      (subMenu) => Boolean(subMenu.permissionId) && subMenu.permission?.toLowerCase() !== "access",
    ),
  );
  const selectedGrantableSubmenus = grantableSubmenus.filter(
    (subMenu) => subMenu.permissionId && selectedSubmenuIds.has(subMenu.permissionId),
  );
  const allGrantableSubmenusSelected =
    grantableSubmenus.length > 0 && selectedGrantableSubmenus.length === grantableSubmenus.length;
  const subMenuCount = permissionMenus.reduce((total, menu) => total + menu.subMenus.length, 0);
  const accessCount = permissionMenus.reduce(
    (total, menu) =>
      total + menu.subMenus.filter((item) => item.permission?.toLowerCase() === "access").length,
    0,
  );
  const noAccessCount = permissionMenus.reduce(
    (total, menu) =>
      total +
      menu.subMenus.filter((item) => item.permission?.toLowerCase() === "not access").length,
    0,
  );

  return (
    <div className="spr-admin-menu-permissions mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1680ff] shadow-sm">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Menu Permission</h1>
          <p className="text-sm text-slate-500">
            Review menu access assigned to each admin account.
          </p>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">UserNames</h2>
                <p className="mt-0.5 text-xs text-slate-500">Choose an account to inspect</p>
              </div>
              {!namesQuery.isLoading && !namesQuery.isError && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {namesQuery.data?.length ?? 0}
                </span>
              )}
            </div>
          </div>

          {!namesQuery.isLoading && !namesQuery.isError && (namesQuery.data?.length ?? 0) > 0 && (
            <div className="p-3">
              <label className="relative block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search Usernames"
                  aria-label="Search admin names"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </label>
            </div>
          )}

          <div className="max-h-[calc(100dvh-23rem)] overflow-y-auto px-3 pb-3">
            {namesQuery.isLoading ? (
              <div
                className="flex items-center gap-2 px-2 py-3 text-sm text-slate-500"
                role="status"
              >
                <Spinner className="h-4 w-4" />
                Loading names...
              </div>
            ) : namesQuery.isError ? (
              <div className="p-2">
                <ErrorMessage
                  message={
                    namesQuery.error instanceof Error
                      ? namesQuery.error.message
                      : "Failed to load admin names."
                  }
                />
                <button
                  type="button"
                  onClick={() => void namesQuery.refetch()}
                  className="mt-3 text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Try again
                </button>
              </div>
            ) : filteredNames.length ? (
              <ul className="flex flex-col gap-1">
                {filteredNames.map((name) => {
                  const isSelected = selectedUsername === name;
                  return (
                    <li key={name}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedUsername(name);
                          setSelectedSubmenuIds(new Set());
                          setSelectedDeleteSubmenuIds(new Set());
                          setSelectedAllSubmenus(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-amber-50 font-semibold text-amber-900 ring-1 ring-inset ring-amber-200"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            isSelected
                              ? "bg-amber-200 text-amber-900"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{name}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0 text-amber-700" aria-hidden />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-2 py-4 text-center text-sm text-slate-500">
                {search ? "No admins match your search." : "No admin names found."}
              </p>
            )}
          </div>
        </section>

        <section className="flex max-h-[calc(100dvh-15rem)] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Menu permissions</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {selectedUsername
                  ? "Access assigned to this admin"
                  : "Select an admin to view their access"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedUsername && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  {selectedUsername}
                </span>
              )}
              {selectedUsername && (
                <button
                  type="button"
                  onClick={() => void menusQuery.refetch()}
                  disabled={menusQuery.isFetching}
                  aria-label="Refresh menu permissions"
                  title="Refresh permissions"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${menusQuery.isFetching ? "animate-spin" : ""}`}
                    aria-hidden
                  />
                </button>
              )}
            </div>
          </div>

          {!selectedUsername ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <ListFilter className="h-6 w-6" aria-hidden />
              </span>
              <p className="font-semibold text-slate-800">Choose an admin</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Select a name from the list to see its menus and permission levels.
              </p>
            </div>
          ) : menusQuery.isLoading ? (
            <div
              className="flex flex-1 items-center justify-center gap-2 py-10 text-sm text-slate-500"
              role="status"
            >
              <Spinner className="h-4 w-4" /> Loading permissions...
            </div>
          ) : menusQuery.isError ? (
            <div className="p-5">
              <ErrorMessage
                message={
                  menusQuery.error instanceof Error
                    ? menusQuery.error.message
                    : "Failed to load menu permissions."
                }
              />
              <button
                type="button"
                onClick={() => void menusQuery.refetch()}
                className="mt-3 text-sm font-medium text-amber-700 hover:text-amber-800"
              >
                Try again
              </button>
            </div>
          ) : menusQuery.data?.length ? (
            <div className="flex min-h-0 flex-1 flex-col">
              {addPermissionMutation.isError && (
                <div className="border-b border-slate-100 p-4">
                  <ErrorMessage message={getRequestErrorMessage(addPermissionMutation.error)} />
                </div>
              )}
              {deletePermissionMutation.isError && (
                <div className="border-b border-slate-100 p-4">
                  <ErrorMessage message={getRequestErrorMessage(deletePermissionMutation.error)} />
                </div>
              )}
              <div className="grid shrink-0 grid-cols-3 gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ListFilter className="h-4 w-4" aria-hidden />
                    Menus
                  </div>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {permissionMenus.length}
                  </p>
                  <p className="text-[11px] text-slate-500">{subMenuCount} submenus</p>
                </div>
                <div className="rounded-lg border border-green-100 bg-white p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <KeyRound className="h-4 w-4 text-green-600" aria-hidden />
                    Access
                  </div>
                  <p className="mt-1 text-xl font-semibold text-green-700">{accessCount}</p>
                </div>
                <div className="rounded-lg border border-red-100 bg-white p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <LockKeyhole className="h-4 w-4 text-red-600" aria-hidden />
                    No access
                  </div>
                  <p className="mt-1 text-xl font-semibold text-red-700">{noAccessCount}</p>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm text-slate-700">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="border-b border-r border-slate-200 px-4 py-3">Menu name</th>
                      <th className="border-b border-r border-slate-200 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={allGrantableSubmenusSelected}
                              disabled={
                                grantableSubmenus.length === 0 || addPermissionMutation.isPending
                              }
                              onChange={(event) => {
                                setSelectedAllSubmenus(event.target.checked);
                                setSelectedSubmenuIds((current) => {
                                  const updated = new Set(current);
                                  for (const subMenu of grantableSubmenus) {
                                    const submenuId = subMenu.permissionId;
                                    if (!submenuId) continue;
                                    if (event.target.checked) {
                                      updated.add(submenuId);
                                    } else {
                                      updated.delete(submenuId);
                                    }
                                  }
                                  return updated;
                                });
                              }}
                              aria-label="Select all submenus without access"
                              className="h-4 w-4 rounded border-slate-300 accent-amber-500"
                            />
                            <span>Submenu name</span>
                          </label>
                          {selectedGrantableSubmenus.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!selectedUsername) {
                                  return;
                                }

                                const submenuIds = selectedGrantableSubmenus.flatMap((subMenu) =>
                                  subMenu.permissionId ? [subMenu.permissionId] : [],
                                );
                                addPermissionMutation.reset();
                                addPermissionMutation.mutate(
                                  {
                                    SubmenuId: submenuIds,
                                    UserName: selectedUsername,
                                  },
                                  {
                                    onSuccess: (_response, payload) => {
                                      setSelectedSubmenuIds((current) => {
                                        const remaining = new Set(current);
                                        payload.SubmenuId.forEach((id) => remaining.delete(id));
                                        return remaining;
                                      });
                                    },
                                  },
                                );
                              }}
                              disabled={addPermissionMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors enabled:hover:bg-[#B89328] disabled:cursor-default disabled:opacity-60"
                            >
                              <span>
                                {addPermissionMutation.isPending
                                  ? "Applying..."
                                  : selectedAllSubmenus
                                    ? "All Access"
                                    : "Access"}
                              </span>
                              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white">
                                {selectedGrantableSubmenus.length}
                              </span>
                            </button>
                          )}
                        </div>
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3">Permission</th>
                      <th
                        scope="col"
                        className="w-48 min-w-48 border-b border-l border-slate-200 px-3 py-3 text-center"
                      >
                        <div className="flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap">
                          <label className="flex shrink-0 items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={allDeletableSubmenusSelected}
                              disabled={
                                deletableSubmenus.length === 0 || deletePermissionMutation.isPending
                              }
                              onChange={(event) => {
                                setSelectedDeleteSubmenuIds((current) => {
                                  const updated = new Set(current);
                                  for (const subMenu of deletableSubmenus) {
                                    const submenuId = subMenu.permissionId;
                                    if (!submenuId) continue;
                                    if (event.target.checked) {
                                      updated.add(submenuId);
                                    } else {
                                      updated.delete(submenuId);
                                    }
                                  }
                                  return updated;
                                });
                              }}
                              aria-label="Select all actions"
                              className="h-4 w-4 rounded border-slate-300 accent-amber-500"
                            />
                            <span>Action</span>
                          </label>
                          {selectedDeletableSubmenus.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!selectedUsername) return;
                                deletePermissionMutation.reset();
                                setPermissionToDelete({
                                  submenuIds: selectedDeletableSubmenus.flatMap((subMenu) =>
                                    subMenu.permissionId ? [subMenu.permissionId] : [],
                                  ),
                                  submenuNames: selectedDeletableSubmenus.map(
                                    (subMenu) => subMenu.name,
                                  ),
                                  username: selectedUsername,
                                });
                              }}
                              disabled={deletePermissionMutation.isPending}
                              className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                              Delete ({selectedDeletableSubmenus.length})
                            </button>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {permissionMenus.map((menu) =>
                      menu.subMenus.length ? (
                        menu.subMenus.map((subMenu, index) => (
                          <tr key={subMenu.id} className="transition-colors hover:bg-amber-50/40">
                            {index === 0 && (
                              <th
                                scope="rowgroup"
                                rowSpan={menu.subMenus.length}
                                className="border-r border-slate-100 px-4 py-3 align-top font-medium text-slate-900"
                              >
                                {menu.name}
                              </th>
                            )}
                            <td className="border-r border-slate-100 px-4 py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    subMenu.permission?.toLowerCase() === "access" ||
                                    Boolean(
                                      subMenu.permissionId &&
                                      selectedSubmenuIds.has(subMenu.permissionId),
                                    )
                                  }
                                  onChange={(event) => {
                                    const submenuId = subMenu.permissionId;
                                    if (
                                      !submenuId ||
                                      subMenu.permission?.toLowerCase() === "access"
                                    ) {
                                      return;
                                    }

                                    setSelectedAllSubmenus(false);
                                    setSelectedSubmenuIds((current) => {
                                      const updated = new Set(current);
                                      if (event.target.checked) {
                                        updated.add(submenuId);
                                      } else {
                                        updated.delete(submenuId);
                                      }
                                      return updated;
                                    });
                                  }}
                                  disabled={
                                    !subMenu.permissionId ||
                                    subMenu.permission?.toLowerCase() === "access" ||
                                    addPermissionMutation.isPending
                                  }
                                  aria-label={`Select ${subMenu.name}`}
                                  className="h-4 w-4 rounded border-slate-300 accent-amber-500 disabled:cursor-default"
                                />
                                <span>{subMenu.name}</span>
                              </div>
                            </td>
                            <td className="border-l border-slate-200 px-4 py-3 text-center">
                              <div className="flex flex-wrap items-center gap-2">
                                {subMenu.permission ? (
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                      subMenu.permission.toLowerCase() === "not access"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-amber-100 text-amber-900"
                                    }`}
                                  >
                                    {subMenu.permission}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Not specified</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={Boolean(
                                    subMenu.permissionId &&
                                    selectedDeleteSubmenuIds.has(subMenu.permissionId),
                                  )}
                                  onChange={(event) => {
                                    const submenuId = subMenu.permissionId;
                                    if (!submenuId) return;
                                    setSelectedDeleteSubmenuIds((current) => {
                                      const updated = new Set(current);
                                      if (event.target.checked) {
                                        updated.add(submenuId);
                                      } else {
                                        updated.delete(submenuId);
                                      }
                                      return updated;
                                    });
                                  }}
                                  disabled={
                                    !subMenu.permissionId || deletePermissionMutation.isPending
                                  }
                                  aria-label={`Select delete action for ${subMenu.name}`}
                                  className="h-4 w-4 rounded border-slate-300 accent-amber-500 disabled:cursor-default"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const submenuId = subMenu.permissionId;
                                    if (!selectedUsername || !submenuId) {
                                      return;
                                    }

                                    deletePermissionMutation.reset();
                                    setPermissionToDelete({
                                      submenuIds: [submenuId],
                                      submenuNames: [subMenu.name],
                                      username: selectedUsername,
                                    });
                                  }}
                                  disabled={
                                    !subMenu.permissionId || deletePermissionMutation.isPending
                                  }
                                  title="Delete permission"
                                  aria-label={`Delete permission for ${subMenu.name}`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr key={menu.id} className="transition-colors hover:bg-amber-50/40">
                          <th
                            scope="row"
                            className="border-r border-slate-100 px-4 py-3 font-medium text-slate-900"
                          >
                            {menu.name}
                          </th>
                          <td className="border-r border-slate-100 px-4 py-3 text-slate-400">—</td>
                          <td className="border-l border-slate-200 px-4 py-3 text-center text-slate-400">
                            —
                          </td>
                          <td className="px-4 py-3 text-slate-400">—</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No menu permissions found for this admin.
            </p>
          )}
        </section>
      </div>
      <ConfirmDialog
        isOpen={permissionToDelete !== null}
        title={
          permissionToDelete?.submenuIds.length === 1
            ? `Delete permission for ${permissionToDelete.submenuNames[0]}?`
            : `Delete ${permissionToDelete?.submenuIds.length ?? 0} permissions?`
        }
        description={`This will remove ${permissionToDelete?.submenuIds.length === 1 ? `the permission for ${permissionToDelete.submenuNames[0]}` : `${permissionToDelete?.submenuIds.length ?? 0} selected permissions`} from ${permissionToDelete?.username ?? "this user"}.`}
        confirmLabel="Submit"
        isDestructive
        isLoading={deletePermissionMutation.isPending}
        className="max-w-sm p-4"
        onConfirm={confirmDeletePermission}
        onCancel={() => {
          setPermissionToDelete(null);
        }}
      />
    </div>
  );
}
