import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqGate } from "@/modules/account/lib/FaqGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Faq");
  return { title: t("title") };
}

export default function Page() {
  return <FaqGate roleSegment="athlete" />;
}
