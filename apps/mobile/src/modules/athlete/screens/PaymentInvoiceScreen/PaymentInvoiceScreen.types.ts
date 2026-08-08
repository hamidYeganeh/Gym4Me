import type { Invoice } from "../../lib/payment-data";

export type PaymentMethodId = "wallet" | "gateway";

export type PaymentInvoiceScreenProps = {
  invoice?: Invoice;
  walletBalanceLabel: string;
};
