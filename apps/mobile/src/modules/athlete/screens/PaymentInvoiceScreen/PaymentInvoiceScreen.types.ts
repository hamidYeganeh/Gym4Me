import type { Invoice } from "../../lib/payment-data";

export type PaymentMethodId = "wallet" | "gateway";

export type PaymentInvoiceScreenProps = {
  invoice?: Invoice;
  walletBalanceLabel: string;
  /** Real invoices are receipts issued after capture. */
  alreadyPaid?: boolean;
  pending?: boolean;
  onPay?: (method: PaymentMethodId) => void;
  onPaidContinue?: () => void;
};
