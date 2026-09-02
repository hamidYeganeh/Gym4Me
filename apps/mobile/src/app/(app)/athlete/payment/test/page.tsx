import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TestPaymentGatewayScreen } from "@/modules/athlete/screens/TestPaymentGatewayScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Payment.testGateway");
  return { title: t("pageTitle") };
}

export default function TestPaymentGatewayPage() {
  return (
    <Suspense>
      <TestPaymentGatewayScreen />
    </Suspense>
  );
}
