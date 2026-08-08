import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RolePlaceholderScreen } from "@/modules/app/screens/RolePlaceholderScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RolePages");
  return { title: t("resourcesTitle") };
}

export default async function Page() {
  const t = await getTranslations("RolePages");
  return (
    <RolePlaceholderScreen
      description={t("placeholder")}
      title={t("resourcesTitle")}
    />
  );
}
