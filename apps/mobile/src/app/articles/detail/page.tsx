import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ArticleDetailScreen } from "@/modules/articles/screens/ArticleDetailScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Articles");
  return { title: t("detailTitle") };
}

export default function ArticleDetailPage() {
  return (
    <Suspense fallback={null}>
      <ArticleDetailScreen />
    </Suspense>
  );
}
