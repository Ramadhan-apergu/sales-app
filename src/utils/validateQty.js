// Shared Qty format rule for stock adjustment (manual enter & Excel
// upload): decimal separator must be a dot "." (not a comma), with at
// most 2 digits after it. Integers and 1-decimal values are also valid.
const QTY_FORMAT_REGEX = /^-?\d+(\.\d{1,2})?$/;

export function isValidQtyFormat(value) {
  if (value === null || value === undefined) return false;
  const str = String(value).trim();
  if (str === "") return false;
  return QTY_FORMAT_REGEX.test(str);
}

export const QTY_FORMAT_MESSAGE =
  "Qty must use a dot (.) as the decimal separator, with a maximum of 2 decimal digits";

// Mirrors helpers.MaxReasonableQty on the backend (backend/helpers/validation.go).
// Blunt safety net against paste/format accidents (e.g. scientific
// notation) that would otherwise post an astronomically large qty - see
// doc/phase4a-investigate-corrupted-stock.sql for the incident that
// prompted this. Keep this in sync with the backend constant.
export const MAX_REASONABLE_QTY = 1_000_000;

export function isQtyInRange(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return false;
  return Math.abs(num) <= MAX_REASONABLE_QTY;
}

export const QTY_RANGE_MESSAGE = `Qty exceeds the maximum allowed magnitude of ${MAX_REASONABLE_QTY.toLocaleString(
  "en-US"
)}. If this is really correct, split it into smaller entries or contact an admin.`;
