import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationsScreen } from "@/modules/account/screens/NotificationsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Notifications");
  return { title: t("pageTitle") };
}

export default function CoachNotificationsPage() {
  return <NotificationsScreen roleSegment="coach" />;
}
