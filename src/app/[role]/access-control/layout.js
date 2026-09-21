import { assertSectionAccess } from "@/config/roleAccess";

export default async function AccessControlLayout({ children, params }) {
  const { role } = await params;
  assertSectionAccess(role, "access-control");

  return children;
}
