import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForceUpdateScreen } from "@/modules/app/screens/ForceUpdateScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ForceUpdate");
  return { title: t("pageTitle") };
}

export default function ForceUpdatePage() {
  return (
    <ForceUpdateScreen
      currentVersion="1.0.0"
      minimumVersion="1.1.0"
      updateUrl="https://gym4me.ir/download"
    />
  );
}
