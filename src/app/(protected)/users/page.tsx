"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useState } from "react";

export default function UsersPage() {
  const [page, setPage] = useState(1);

  return (
    <>
      <PageHeader title="Users" description="Manage who has access to this workspace." />
      <UsersTable page={page} onPageChange={setPage} />
    </>
  );
}
