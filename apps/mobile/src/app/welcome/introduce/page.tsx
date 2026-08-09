import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WelcomeIntroduceScreen } from "@/modules/app/screens/WelcomeIntroduceScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.WelcomeIntroduce");
  return { title: t("title") };
}

export default function WelcomeIntroducePage() {
  return <WelcomeIntroduceScreen />;
}
