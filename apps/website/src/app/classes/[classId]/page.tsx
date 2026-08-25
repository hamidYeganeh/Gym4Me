import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SeoClassDetailScreen } from "@/modules/discovery/screens/SeoClassDetailScreen";
import { discoveryClasses, mediaFileUrl } from "@/shared/lib/api";

type Props = {
  params: Promise<{ classId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classId } = await params;
  const t = await getTranslations("PublicClasses");
  try {
    const item = await discoveryClasses.get(classId);
    const image = mediaFileUrl(item.media.coverMediaId) ?? undefined;
    return {
      title: item.title,
      description: item.description ?? t("metaDescription"),
      alternates: { canonical: `/classes/${item.id}` },
      openGraph: {
        title: item.title,
        description: item.description ?? t("metaDescription"),
        type: "website",
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    return { title: t("detailFallbackTitle") };
  }
}

export default async function ClassPage({ params }: Props) {
  const { classId } = await params;
  return <SeoClassDetailScreen classId={classId} />;
}
