import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllClassParams,
  getClassDetail,
} from "@/modules/discovery/lib/class-detail-data";
import { DiscoveryClubsClassDetailScreen } from "@/modules/discovery/screens/DiscoveryClubsClassDetailScreen";

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
  const classDetail = getClassDetail(clubId, classId);

  if (!classDetail) {
    notFound();
  }

  return <DiscoveryClubsClassDetailScreen classDetail={classDetail} />;
}
