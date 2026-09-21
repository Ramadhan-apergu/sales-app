import { assertSectionAccess } from "@/config/roleAccess";

export default async function SalesActivityLayout({ children, params }) {
  const { role } = await params;
  assertSectionAccess(role, "sales-activity");

  return children;
}
