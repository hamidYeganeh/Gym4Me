import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { DiscoveryClassByIdGate } from "@/modules/discovery/lib/DiscoveryClassByIdGate";
import {
  getAllClassIds,
  getClassDetailById,
} from "@/modules/discovery/lib/class-detail-data";

type ClassDetailPageProps = {
  params: Promise<{ classId: string }>;
};

export function generateStaticParams() {
  return getAllClassIds().map((classId) => ({ classId }));
}

export async function generateMetadata({
  params,
}: ClassDetailPageProps): Promise<Metadata> {
  const { classId } = await params;
  const detail = getClassDetailById(classId);
  const t = await getTranslations("ClubClassDetail");
  return { title: detail?.title ?? t("notFound") };
}

export default async function DiscoveryClassDetailPage({
  params,
}: ClassDetailPageProps) {
  const { classId } = await params;
  return (
    <Suspense fallback={null}>
      <DiscoveryClassByIdGate classId={classId} />
    </Suspense>
  );
}
