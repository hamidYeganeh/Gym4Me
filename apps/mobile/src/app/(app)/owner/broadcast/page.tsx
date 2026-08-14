import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerBroadcastGate } from "@/modules/owner/lib/OwnerBroadcastGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerBroadcast");
  return { title: t("pageTitle") };
}

export default function OwnerBroadcastPage() {
  return <OwnerBroadcastGate />;
}
