import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CommunityHomeScreenLoader } from "@/modules/community/screens/CommunityHomeScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CommunityHome");
  return { title: t("pageTitle") };
}

export default function CommunityPage() {
  return <CommunityHomeScreenLoader />;
}
