import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerHomeGate } from "@/modules/owner/lib/OwnerHomeGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerHome");
  return { title: t("title") };
}

export default function OwnerHomePage() {
  return <OwnerHomeGate />;
}
