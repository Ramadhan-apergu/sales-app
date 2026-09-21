import { assertTransactionAccess } from "@/config/roleAccess";

export default async function RmaLayout({ children, params }) {
  const { role } = await params;
  assertTransactionAccess(role, "rma");

  return children;
}
