import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteProgressPhotosGate } from "@/modules/athlete/lib/AthleteProgressPhotosGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteProgressPhotos");
  return { title: t("pageTitle") };
}

export default function AthleteProgressPhotosPage() {
  return <AthleteProgressPhotosGate />;
}
