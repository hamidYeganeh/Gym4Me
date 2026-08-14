import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteThreadGate } from "@/modules/athlete/lib/AthleteThreadGate";
import { ATHLETE_MESSAGE_THREADS } from "@/modules/athlete/lib/athlete-messages-data";

type AthleteThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export function generateStaticParams() {
  return ATHLETE_MESSAGE_THREADS.map(({ id: threadId }) => ({ threadId }));
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
