"use client";

import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/common/DataTable";
import { useUsers } from "@/features/users/hooks/useUsers";
import { formatDate } from "@/lib/utils";
import type { User } from "@/features/users/types";
import type { TableColumn } from "@/components/ui/Table";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

const columns: TableColumn<User>[] = [
  { key: "name", header: "Name", render: (user) => user.name },
  { key: "email", header: "Email", render: (user) => user.email },
  {
    key: "role",
    header: "Role",
    render: (user) => <Badge variant="primary">{user.role}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    render: (user) => (
      <Badge variant={user.isActive ? "success" : "default"}>
        {user.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  { key: "createdAt", header: "Joined", render: (user) => formatDate(user.createdAt) },
];

interface UsersTableProps {
  page?: number;
  onPageChange?: (page: number) => void;
}

export function UsersTable({ page = 1, onPageChange }: UsersTableProps = {}) {
  const { data, isLoading, isError, refetch } = useUsers({ page, pageSize: DEFAULT_PAGE_SIZE });

  return (
    <DataTable<User>
      columns={columns}
      data={data?.items ?? []}
      getRowId={(user) => user.id}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      page={data?.page ?? page}
      totalPages={data?.totalPages ?? 1}
      onPageChange={onPageChange}
      emptyTitle="No users yet"
    />
  );
}
