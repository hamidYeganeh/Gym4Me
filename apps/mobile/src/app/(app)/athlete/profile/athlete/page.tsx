import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteProfileEditScreen } from "@/modules/athlete/screens/AthleteProfileEditScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.AthleteProfile");
  return { title: t("title") };
}

export default function Page() {
  return <AthleteProfileEditScreen />;
}
