import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SettingsScreen } from "@/modules/account/screens/SettingsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Settings");
  return { title: t("title") };
}

export default function Page() {
  return <SettingsScreen roleSegment="coach" />;
}
