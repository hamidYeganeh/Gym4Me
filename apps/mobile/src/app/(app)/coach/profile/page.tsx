import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BaseProfileScreen } from "@/modules/account/screens/BaseProfileScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Profile");
  return { title: t("title") };
}

export default function Page() {
  return <BaseProfileScreen roleSegment="coach" />;
}
