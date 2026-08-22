import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArticlesListScreen } from "@/modules/articles/screens/ArticlesListScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Articles");
  return { title: t("metaTitle") };
}

export default function ArticlesPage() {
  return <ArticlesListScreen />;
}
