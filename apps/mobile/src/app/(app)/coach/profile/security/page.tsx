import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SecuritySettingsScreen } from "@/modules/account/screens/SecuritySettingsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.SecuritySettings");
  return { title: t("title") };
}

export default function Page() {
  return <SecuritySettingsScreen roleSegment="coach" />;
}
