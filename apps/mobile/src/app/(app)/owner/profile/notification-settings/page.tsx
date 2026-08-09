import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationSettingsScreen } from "@/modules/account/screens/NotificationSettingsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.NotificationSettings");
  return { title: t("title") };
}

export default function Page() {
  return <NotificationSettingsScreen roleSegment="owner" />;
}
