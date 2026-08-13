import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteSocialCreateGate } from "@/modules/athlete/lib/AthleteSocialCreateGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteSocial");
  return { title: t("createPageTitle") };
}

export default function AthleteSocialCreatePage() {
  return <AthleteSocialCreateGate />;
}
