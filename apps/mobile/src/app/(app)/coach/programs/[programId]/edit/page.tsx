import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachProgramEditorGate } from "@/modules/coach/lib/CoachProgramEditorGate";
import {
  getAllCoachProgramIds,
  getCoachProgramEditorDetail,
} from "@/modules/coach/lib/coach-program-editor-data";

type CoachProgramEditPageProps = {
  params: Promise<{ programId: string }>;
};

export function generateStaticParams() {
  return getAllCoachProgramIds().map((programId) => ({ programId }));
}

export async function generateMetadata({
  params,
}: CoachProgramEditPageProps): Promise<Metadata> {
  const t = await getTranslations("CoachProgramEditor");
  const { programId } = await params;
  const program = getCoachProgramEditorDetail(programId);
  return {
    title: program ? `${t("editPageTitle")} · ${program.title}` : t("editPageTitle"),
  };
}

export default async function CoachProgramEditPage({
  params,
}: CoachProgramEditPageProps) {
  const { programId } = await params;
  return <CoachProgramEditorGate mode="edit" programId={programId} />;
}
