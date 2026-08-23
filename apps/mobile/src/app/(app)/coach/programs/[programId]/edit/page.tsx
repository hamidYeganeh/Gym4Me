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

type CoachProgramEditPageProps = {
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
}: CoachProgramEditPageProps): Promise<Metadata> {
  const t = await getTranslations("CoachProgramEditor");
  const { programId } = await params;
  const program = canUseDemoFixtureId(programId)
    ? getCoachProgramEditorDetail(programId)
    : undefined;
  return {
    title: program
      ? `${t("editPageTitle")} · ${program.title}`
      : t("editPageTitle"),
  };
}

export default async function CoachProgramEditPage({
  params,
}: CoachProgramEditPageProps) {
  const { programId } = await params;
  return <CoachProgramEditorGate mode="edit" programId={programId} />;
}
