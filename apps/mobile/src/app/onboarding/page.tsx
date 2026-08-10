import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OnboardingScreen } from "@/modules/app/screens/OnboardingScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Onboarding");
  return { title: t("title") };
}

export default function OnboardingPage() {
  return <OnboardingScreen />;
}
