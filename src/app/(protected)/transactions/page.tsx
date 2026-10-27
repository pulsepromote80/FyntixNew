import { PageHeader } from "@/components/common/PageHeader";
import { TransactionsTable } from "@/features/transactions/components/TransactionsTable";

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" description="View and track transaction activity." />
      <TransactionsTable />
    </>
  );
}
