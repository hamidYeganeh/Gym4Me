import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachProgramEditorGate } from "@/modules/coach/lib/CoachProgramEditorGate";
import {
  getAllCoachProgramIds,
  getCoachProgramEditorDetail,
} from "@/modules/coach/lib/coach-program-editor-data";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type CoachProgramDetailPageProps = {
  params: Promise<{ programId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllCoachProgramIds().map((programId) => ({ programId })),
    [{ programId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata({
  params,
}: CoachProgramDetailPageProps): Promise<Metadata> {
  const { programId } = await params;
  const program = canUseDemoFixtureId(programId)
    ? getCoachProgramEditorDetail(programId)
    : undefined;
  return { title: program?.title ?? "Program" };
}

export default async function CoachProgramDetailPage({
  params,
}: CoachProgramDetailPageProps) {
  const { programId } = await params;
  return <CoachProgramEditorGate mode="view" programId={programId} />;
}
