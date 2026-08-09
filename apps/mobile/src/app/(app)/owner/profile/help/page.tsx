import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HelpCenterScreen } from "@/modules/account/screens/HelpCenterScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.HelpCenter");
  return { title: t("title") };
}

export default function Page() {
  return <HelpCenterScreen roleSegment="owner" />;
}
