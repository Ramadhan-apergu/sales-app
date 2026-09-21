import { assertValidRole } from "@/config/roleAccess";

// Every page under [role] is shared by super-admin, sales-indoor,
// accounting and finance. This guard 404s any other first path segment
// (middleware.js already blocks unauthenticated/unauthorized access to
// the 4 real roles - this just protects against an unknown role slug
// matching the dynamic segment).
export default async function RoleLayout({ children, params }) {
  const { role } = await params;
  assertValidRole(role);
  return children;
}
