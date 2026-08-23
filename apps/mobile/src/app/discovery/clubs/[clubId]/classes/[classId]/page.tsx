import type { Metadata } from "next";
import { DiscoveryClassDetailGate } from "@/modules/discovery/lib/DiscoveryClassDetailGate";
import {
  getAllClassParams,
  getClassDetail,
} from "@/modules/discovery/lib/class-detail-data";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type ClassDetailPageProps = {
  params: Promise<{ clubId: string; classId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(getAllClassParams, [
    {
      clubId: STATIC_EXPORT_PLACEHOLDER_ID,
      classId: STATIC_EXPORT_PLACEHOLDER_ID,
    },
  ]);
}

export async function generateMetadata({
  params,
}: ClassDetailPageProps): Promise<Metadata> {
  const { clubId, classId } = await params;
  const classDetail =
    canUseDemoFixtureId(clubId) && canUseDemoFixtureId(classId)
      ? getClassDetail(clubId, classId)
      : undefined;

  if (!classDetail) {
    return { title: "Class" };
  }

  return { title: classDetail.title };
}

export default async function ClassDetailPage({
  params,
}: ClassDetailPageProps) {
  const { clubId, classId } = await params;

  return <DiscoveryClassDetailGate clubId={clubId} classId={classId} />;
}
