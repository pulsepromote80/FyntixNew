import { PageHeader } from "@/components/common/PageHeader";
import { OrderHistoryTable } from "@/features/order-history/components/OrderHistoryTable";

export default function OrderHistoryPage() {
  return (
    <>
      <PageHeader title="Order History" description="View your order history and recharge details." />
      <div className="p-6">
        <OrderHistoryTable />
      </div>
    </>
  );
}
