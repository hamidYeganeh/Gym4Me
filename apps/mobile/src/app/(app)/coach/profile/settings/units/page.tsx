import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UnitsSettingsScreen } from "@/modules/account/screens/UnitsSettingsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.UnitsSettings");
  return { title: t("title") };
}

export default function Page() {
  return <UnitsSettingsScreen roleSegment="coach" />;
}
