/**
 * User-facing labels for system / DB values.
 * Do not rename Prisma models here — display aliases only.
 * Glossary: docs/senda-4.0/product/connect-concepts.md §0
 */

export const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  instructed: "Pay in progress",
  proven: "Confirmed",
  needs_reconcile: "Needs a check",
  cancelled: "Cancelled",
};

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export const FLAG_LABEL: Record<string, string> = {
  stale: "Out of date — refresh before paying",
};

export function flagLabel(flag: string): string {
  return FLAG_LABEL[flag] ?? flag;
}
