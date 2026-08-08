import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ATHLETE_MEMBERSHIPS } from "@/modules/athlete/lib/memberships-data";
import { AthleteMembershipsScreen } from "@/modules/athlete/screens/AthleteMembershipsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteMemberships");
  return { title: t("pageTitle") };
}

export default function AthleteMembershipsPage() {
  return <AthleteMembershipsScreen memberships={ATHLETE_MEMBERSHIPS} />;
}
