import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoveryClassByIdGate } from "@/modules/discovery/lib/DiscoveryClassByIdGate";
import {
  getAllClassIds,
  getClassDetailById,
} from "@/modules/discovery/lib/class-detail-data";
import { BROWSE_CLASSES } from "@/modules/discovery/lib/classes-browse-data";

type ClassDetailPageProps = {
  params: Promise<{ classId: string }>;
};

export function generateStaticParams() {
  const fromCatalog = getAllClassIds();
  const fromBrowse = BROWSE_CLASSES.map((item) => item.id);
  return [...new Set([...fromCatalog, ...fromBrowse])].map((classId) => ({
    classId,
  }));
}

export async function generateMetadata({
  params,
}: ClassDetailPageProps): Promise<Metadata> {
  const { classId } = await params;
  const classDetail = getClassDetailById(classId);
  const browse = BROWSE_CLASSES.find((item) => item.id === classId);

  if (classDetail) {
    return { title: classDetail.title };
  }
  if (browse) {
    return { title: browse.title };
  }
  return { title: "Class" };
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
