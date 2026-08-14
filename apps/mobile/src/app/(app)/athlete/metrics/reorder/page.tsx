import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteMetricsReorderGateDynamic } from "@/modules/athlete/lib/AthleteMetricsReorderGateDynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FitnessMetricsReorder");
  return { title: t("title") };
}

export default function AthleteMetricsReorderPage() {
  return <AthleteMetricsReorderGateDynamic />;
}
