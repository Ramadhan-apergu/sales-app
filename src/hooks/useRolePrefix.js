"use client";

import { useParams } from "next/navigation";

/**
 * Returns the current role-scoped path prefix, e.g. "/accounting",
 * "/finance", "/sales-indoor", "/super-admin" - derived from the
 * `[role]` dynamic route segment. Pages under `src/app/[role]/**` are
 * shared across every role; use this instead of hardcoding a prefix so
 * the same page works no matter which role is browsing it.
 */
export default function useRolePrefix() {
  const { role } = useParams();
  return `/${role}`;
}
