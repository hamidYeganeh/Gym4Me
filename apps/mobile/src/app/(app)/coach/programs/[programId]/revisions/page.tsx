import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachProgramRevisionsGate } from "@/modules/coach/lib/CoachProgramRevisionsGate";
import { getAllCoachProgramIds } from "@/modules/coach/lib/coach-program-editor-data";

type CoachProgramRevisionsPageProps = {
  params: Promise<{ programId: string }>;
};

export function generateStaticParams() {
  return getAllCoachProgramIds().map((programId) => ({ programId }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachProgramRevisions");
  return { title: t("pageTitle") };
}

export default async function CoachProgramRevisionsPage({
  params,
}: CoachProgramRevisionsPageProps) {
  const { programId } = await params;
  return <CoachProgramRevisionsGate programId={programId} />;
}
