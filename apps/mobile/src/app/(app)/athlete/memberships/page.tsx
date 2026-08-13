import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteMembershipsGate } from "@/modules/athlete/lib/AthleteMembershipsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteMemberships");
  return { title: t("pageTitle") };
}

export default function AthleteMembershipsPage() {
  return <AthleteMembershipsGate />;
}
