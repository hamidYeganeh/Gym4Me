import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachThreadGate } from "@/modules/coach/lib/CoachThreadGate";
import { COACH_MESSAGE_THREADS } from "@/modules/coach/lib/coach-messages-data";

type CoachThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export function generateStaticParams() {
  return COACH_MESSAGE_THREADS.map(({ id: threadId }) => ({ threadId }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachMessages");
  return { title: t("threadPageTitle") };
}

export default async function CoachThreadPage({
  params,
}: CoachThreadPageProps) {
  const { threadId } = await params;
  return <CoachThreadGate threadId={threadId} />;
}
