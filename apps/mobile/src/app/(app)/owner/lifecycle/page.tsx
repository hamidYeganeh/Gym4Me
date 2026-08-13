import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerLifecycleGate } from "@/modules/owner/lib/OwnerLifecycleGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerLifecycle");
  return { title: t("pageTitle") };
}

export default function OwnerLifecyclePage() {
  return <OwnerLifecycleGate />;
}
