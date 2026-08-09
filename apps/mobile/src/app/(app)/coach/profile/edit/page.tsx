import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileSettingsScreen } from "@/modules/account/screens/ProfileSettingsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.ProfileSettings");
  return { title: t("title") };
}

export default function Page() {
  return <ProfileSettingsScreen roleSegment="coach" />;
}
