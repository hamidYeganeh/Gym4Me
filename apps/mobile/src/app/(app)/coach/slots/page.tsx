import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachSlotsManageScreen } from "@/modules/coach/screens/CoachSlotsManageScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachSlotsManage");
  return { title: t("pageTitle") };
}

export default function CoachSlotsPage() {
  return <CoachSlotsManageScreen />;
}
