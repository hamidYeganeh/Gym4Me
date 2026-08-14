import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachProgramEditorGate } from "@/modules/coach/lib/CoachProgramEditorGate";
import {
  getAllCoachProgramIds,
  getCoachProgramEditorDetail,
} from "@/modules/coach/lib/coach-program-editor-data";

type CoachProgramDetailPageProps = {
  params: Promise<{ programId: string }>;
};

export function generateStaticParams() {
  return getAllCoachProgramIds().map((programId) => ({ programId }));
}

export async function generateMetadata({
  params,
}: CoachProgramDetailPageProps): Promise<Metadata> {
  const { programId } = await params;
  const program = getCoachProgramEditorDetail(programId);
  return { title: program?.title ?? "Program" };
}

export default async function CoachProgramDetailPage({
  params,
}: CoachProgramDetailPageProps) {
  const { programId } = await params;
  return <CoachProgramEditorGate mode="view" programId={programId} />;
}
