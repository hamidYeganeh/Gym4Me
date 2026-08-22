import { redirect } from "next/navigation";
import { getAllClassIds } from "@/modules/discovery/lib/class-detail-data";

type ClassessDetailPageProps = {
  params: Promise<{ classId: string }>;
};

export function generateStaticParams() {
  return getAllClassIds().map((classId) => ({ classId }));
}

export default async function DiscoveryClassessDetailPage({
  params,
}: ClassessDetailPageProps) {
  const { classId } = await params;
  redirect(`/discovery/classes/${encodeURIComponent(classId)}`);
}
