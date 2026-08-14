import type { OwnerInvoice } from "../../lib/owner-invoices-data";

export type OwnerInvoicesScreenProps = {
  invoices: OwnerInvoice[];
  onExport?: () => void;
  className?: string;
};
