import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COACH_CLIENTS } from "@/modules/coach/lib/coach-clients-data";
import { CoachClientsScreen } from "@/modules/coach/screens/CoachClientsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachClients");
  return { title: t("pageTitle") };
}

export default function CoachClientsPage() {
  return <CoachClientsScreen clients={COACH_CLIENTS} />;
}
