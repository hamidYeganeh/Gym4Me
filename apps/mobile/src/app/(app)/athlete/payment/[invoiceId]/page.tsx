"use client";

import { PaymentInvoiceGate } from "@/modules/athlete/lib/PaymentInvoiceGate";
import { getAllInvoiceIds } from "@/modules/athlete/lib/payment-data";

type PaymentInvoicePageProps = {
  params: Promise<{ invoiceId: string }>;
};

export function generateStaticParams() {
  return getAllInvoiceIds().map((invoiceId) => ({ invoiceId }));
}

export default async function PaymentInvoicePage({
  params,
}: PaymentInvoicePageProps) {
  const { invoiceId } = await params;
  return <PaymentInvoiceGate invoiceId={invoiceId} />;
}
