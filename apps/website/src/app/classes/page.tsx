import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SeoClassesListScreen } from "@/modules/discovery/screens/SeoClassesListScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicClasses");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/classes" },
  };
}

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ClassesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  return <SeoClassesListScreen q={q} />;
}
