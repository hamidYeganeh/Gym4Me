import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  getAllInvoiceIds,
  getInvoice,
  WALLET_BALANCE_LABEL,
} from "@/modules/athlete/lib/payment-data";
import { PaymentInvoiceScreen } from "@/modules/athlete/screens/PaymentInvoiceScreen";

type PaymentInvoicePageProps = {
  params: Promise<{ invoiceId: string }>;
};

export function generateStaticParams() {
  return getAllInvoiceIds().map((invoiceId) => ({ invoiceId }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Payment");
  return { title: t("pageTitle") };
}

export default async function PaymentInvoicePage({
  params,
}: PaymentInvoicePageProps) {
  const { invoiceId } = await params;

  return (
    <PaymentInvoiceScreen
      invoice={getInvoice(invoiceId)}
      walletBalanceLabel={WALLET_BALANCE_LABEL}
    />
  );
}
