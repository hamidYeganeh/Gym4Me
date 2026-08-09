import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WelcomeScreen } from "@/modules/app/screens/WelcomeScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Welcome");
  return { title: t("title") };
}

export default function WelcomePage() {
  return <WelcomeScreen />;
}
