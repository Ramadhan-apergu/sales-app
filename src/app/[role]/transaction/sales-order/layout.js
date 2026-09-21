import { assertTransactionAccess } from "@/config/roleAccess";

export default async function SalesOrderLayout({ children, params }) {
  const { role } = await params;
  assertTransactionAccess(role, "sales-order");

  return children;
}
