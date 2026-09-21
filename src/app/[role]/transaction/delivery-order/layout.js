import { assertTransactionAccess } from "@/config/roleAccess";

export default async function DeliveryOrderLayout({ children, params }) {
  const { role } = await params;
  assertTransactionAccess(role, "delivery-order");

  return children;
}
