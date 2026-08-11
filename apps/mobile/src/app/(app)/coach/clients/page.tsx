import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachClientsGate } from "@/modules/coach/lib/CoachClientsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachClients");
  return { title: t("pageTitle") };
}

export default function CoachClientsPage() {
  return <CoachClientsGate />;
}
