import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PaymentResultScreen } from "@/modules/athlete/screens/PaymentResultScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Payment.result");
  return { title: t("pageTitle") };
}

export default function PaymentResultPage() {
  return (
    <Suspense>
      <PaymentResultScreen />
    </Suspense>
  );
}
