import type { Metadata } from "next";
import { CoachClientDetailGate } from "@/modules/coach/lib/CoachClientDetailGate";
import {
  getAllCoachClientIds,
  getCoachClientDetail,
} from "@/modules/coach/lib/coach-clients-data";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type CoachClientDetailPageProps = {
  params: Promise<{ clientId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllCoachClientIds().map((clientId) => ({ clientId })),
    [{ clientId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata({
  params,
}: CoachClientDetailPageProps): Promise<Metadata> {
  const { clientId } = await params;
  const client = canUseDemoFixtureId(clientId)
    ? getCoachClientDetail(clientId)
    : undefined;
  return { title: client?.name ?? "Client" };
}

export default async function CoachClientDetailPage({
  params,
}: CoachClientDetailPageProps) {
  const { clientId } = await params;
  return <CoachClientDetailGate clientId={clientId} />;
}
