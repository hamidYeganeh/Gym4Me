import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachThreadGate } from "@/modules/coach/lib/CoachThreadGate";
import { COACH_MESSAGE_THREADS } from "@/modules/coach/lib/coach-messages-data";
import {
  buildDemoStaticParams,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type CoachThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => COACH_MESSAGE_THREADS.map(({ id: threadId }) => ({ threadId })),
    [{ threadId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
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
