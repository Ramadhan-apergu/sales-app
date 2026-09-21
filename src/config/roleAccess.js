import { notFound } from "next/navigation";

// Single source of truth for which of the 4 shared back-office roles
// (super-admin, sales-indoor, accounting, finance) can see which section
// of the app. sales-outdoor has its own separate route tree/UI and is not
// part of this shared [role] app, so it isn't listed here.
//
// Used by:
// - src/app/[role]/layout.js (rejects unknown roles)
// - the per-section layout.js guards (rejects roles without access)
// - src/components/shared/Layout.jsx (builds the header/sider/drawer menus)

export const ROLES = ["super-admin", "sales-indoor", "accounting", "finance"];

export const ROLE_LABELS = {
  "super-admin": "Super Admin",
  "sales-indoor": "Sales Indoor",
  accounting: "Accounting",
  finance: "Finance",
};

// true = every sub-page of the section is allowed.
// object = only the listed sub-resource keys are allowed (used for
// "transaction", which is shared by every role but with a different set
// of sub-resources per role).
export const ROLE_ACCESS = {
  "super-admin": {
    home: true,
    "access-control": true,
    "master-data": true,
    inventory: true,
    "sales-activity": true,
    report: true,
    status: true,
    transaction: {
      "sales-order": true,
      "delivery-order": true,
      invoice: true,
      payment: true,
      "credit-memo": true,
      rma: true,
      "customer-refund": true,
    },
  },
  "sales-indoor": {
    home: true,
    "master-data": true,
    inventory: true,
    "sales-activity": true,
    report: true,
    status: true,
    transaction: {
      "sales-order": true,
      "delivery-order": true,
      invoice: true,
      payment: true,
      "credit-memo": true,
      rma: true,
      "customer-refund": true,
    },
  },
  accounting: {
    home: true,
    "master-data": true,
    inventory: true,
    report: true,
    status: true,
    transaction: {
      "sales-order": true,
      "delivery-order": true,
      invoice: true,
      payment: true,
      "credit-memo": true,
    },
  },
  finance: {
    home: true,
    report: true,
    status: true,
    transaction: {
      invoice: true,
      payment: true,
      "credit-memo": true,
    },
  },
};

export function isValidRole(role) {
  return ROLES.includes(role);
}

export function canAccessSection(role, section) {
  return Boolean(ROLE_ACCESS[role]?.[section]);
}

export function canAccessTransaction(role, resource) {
  const transaction = ROLE_ACCESS[role]?.transaction;
  return transaction === true || Boolean(transaction?.[resource]);
}

export function allowedTransactionResources(role) {
  const transaction = ROLE_ACCESS[role]?.transaction;
  if (transaction === true) return null; // all resources
  return Object.keys(transaction || {});
}

// Preferred landing sub-page when a role opens "/transaction" directly -
// same order as the sider menu. Every role has at least one of these
// (see ROLE_ACCESS above), so this always resolves to something.
const TRANSACTION_RESOURCE_PRIORITY = [
  "sales-order",
  "delivery-order",
  "invoice",
  "payment",
  "credit-memo",
  "rma",
  "customer-refund",
];

export function firstTransactionResource(role) {
  return TRANSACTION_RESOURCE_PRIORITY.find((resource) =>
    canAccessTransaction(role, resource),
  );
}

// Guards for use in route `layout.js` files - 404 instead of rendering a
// page the current role has no business seeing. See src/app/[role]/layout.js
// and the per-section layout.js files next to it.
export function assertValidRole(role) {
  if (!isValidRole(role)) notFound();
}

export function assertSectionAccess(role, section) {
  assertValidRole(role);
  if (!canAccessSection(role, section)) notFound();
}

export function assertTransactionAccess(role, resource) {
  assertValidRole(role);
  if (!canAccessTransaction(role, resource)) notFound();
}
