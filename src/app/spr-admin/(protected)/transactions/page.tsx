import { PageHeader } from "@/spr-admin/components/common/PageHeader";
import { TransactionsTable } from "@/spr-admin/features/transactions/components/TransactionsTable";

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" description="View and track transaction activity." />
      <TransactionsTable />
    </>
  );
}
