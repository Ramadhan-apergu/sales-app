import { assertTransactionAccess } from "@/config/roleAccess";

export default async function CustomerRefundLayout({ children, params }) {
  const { role } = await params;
  assertTransactionAccess(role, "customer-refund");

  return children;
}
