import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachPackagesGate } from "@/modules/coach/lib/CoachPackagesGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachPackages");
  return { title: t("pageTitle") };
}

export default function CoachPackagesPage() {
  return <CoachPackagesGate />;
}
