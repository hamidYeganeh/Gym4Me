import { redirect } from "next/navigation";
import { getAllClassIds } from "@/modules/discovery/lib/class-detail-data";
import {
  buildDemoStaticParams,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type ClassessDetailPageProps = {
  params: Promise<{ classId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllClassIds().map((classId) => ({ classId })),
    [{ classId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export default async function DiscoveryClassessDetailPage({
  params,
}: ClassessDetailPageProps) {
  const { classId } = await params;
  redirect(`/discovery/classes/${encodeURIComponent(classId)}`);
}
