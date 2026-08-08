import type { Metadata } from "next";
import { DiscoveryClassDetailGate } from "@/modules/discovery/lib/DiscoveryClassDetailGate";
import {
  getAllClassParams,
  getClassDetail,
} from "@/modules/discovery/lib/class-detail-data";

type ClassDetailPageProps = {
  params: Promise<{ clubId: string; classId: string }>;
};

export function generateStaticParams() {
  return getAllClassParams();
}

export async function generateMetadata({
  params,
}: ClassDetailPageProps): Promise<Metadata> {
  const { clubId, classId } = await params;
  const classDetail = getClassDetail(clubId, classId);

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
