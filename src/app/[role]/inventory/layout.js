import { assertSectionAccess } from "@/config/roleAccess";

export default async function InventoryLayout({ children, params }) {
  const { role } = await params;
  assertSectionAccess(role, "inventory");

  return children;
}
