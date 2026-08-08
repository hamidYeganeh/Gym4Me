import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachProfileEditScreen } from "@/modules/coach/screens/CoachProfileEditScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.CoachProfile");
  return { title: t("title") };
}

export default function Page() {
  return <CoachProfileEditScreen />;
}
