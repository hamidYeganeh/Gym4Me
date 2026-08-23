import { PaymentInvoiceGate } from "@/modules/athlete/lib/PaymentInvoiceGate";
import { getAllInvoiceIds } from "@/modules/athlete/lib/payment-data";
import {
  buildDemoStaticParams,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type PaymentInvoicePageProps = {
  params: Promise<{ invoiceId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllInvoiceIds().map((invoiceId) => ({ invoiceId })),
    [{ invoiceId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export default async function PaymentInvoicePage({
  params,
}: PaymentInvoicePageProps) {
  const { invoiceId } = await params;
  return <PaymentInvoiceGate invoiceId={invoiceId} />;
}
