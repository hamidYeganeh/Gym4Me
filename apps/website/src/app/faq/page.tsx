import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqScreen } from "@/modules/support/screens/FaqScreen";
import { supportApi } from "@/shared/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicFaq");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { canonical: "/faq" },
  };
}

export default async function FaqPage() {
  let items: Awaited<ReturnType<typeof supportApi.listFaq>> = [];
  let error = false;
  try {
    items = await supportApi.listFaq();
  } catch {
    error = true;
  }
  return <FaqScreen error={error} items={items} />;
}
