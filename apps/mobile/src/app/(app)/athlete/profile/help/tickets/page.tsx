import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SupportTicketsGate } from "@/modules/account/lib/SupportTicketsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.SupportTickets");
  return { title: t("title") };
}

export default function Page() {
  return <SupportTicketsGate roleSegment="athlete" />;
}
