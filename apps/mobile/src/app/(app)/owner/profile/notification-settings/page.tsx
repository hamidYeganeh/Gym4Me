import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationSettingsGate } from "@/modules/account/lib/NotificationSettingsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.NotificationSettings");
  return { title: t("title") };
}

export default function Page() {
  return <NotificationSettingsGate roleSegment="owner" />;
}
