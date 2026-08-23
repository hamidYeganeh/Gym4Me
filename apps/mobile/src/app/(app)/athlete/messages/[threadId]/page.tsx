import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteThreadGate } from "@/modules/athlete/lib/AthleteThreadGate";
import { ATHLETE_MESSAGE_THREADS } from "@/modules/athlete/lib/athlete-messages-data";
import {
  buildDemoStaticParams,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type AthleteThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => ATHLETE_MESSAGE_THREADS.map(({ id: threadId }) => ({ threadId })),
    [{ threadId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteMessages");
  return { title: t("threadPageTitle") };
}

export default async function AthleteThreadPage({
  params,
}: AthleteThreadPageProps) {
  const { threadId } = await params;
  return <AthleteThreadGate threadId={threadId} />;
}
