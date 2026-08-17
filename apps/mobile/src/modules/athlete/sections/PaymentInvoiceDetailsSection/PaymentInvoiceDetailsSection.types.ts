import type { Invoice } from "../../lib/payment-data";

export type PaymentInvoiceDetailsSectionProps = {
  invoice: Invoice;
  alreadyPaid: boolean;
  className?: string;
};
