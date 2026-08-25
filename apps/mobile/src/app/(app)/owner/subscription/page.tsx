import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerPlatformSubscriptionGate } from "@/modules/owner/lib/OwnerPlatformSubscriptionGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerPlatformSubscription");
  return { title: t("pageTitle") };
}

export default function OwnerPlatformSubscriptionPage() {
  return <OwnerPlatformSubscriptionGate />;
}
