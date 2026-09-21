import { assertSectionAccess } from "@/config/roleAccess";

export default async function MasterDataLayout({ children, params }) {
  const { role } = await params;
  assertSectionAccess(role, "master-data");

  return children;
}
