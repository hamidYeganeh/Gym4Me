import type { Metadata } from "next";
import { CoachClientDetailGate } from "@/modules/coach/lib/CoachClientDetailGate";
import {
  getAllCoachClientIds,
  getCoachClientDetail,
} from "@/modules/coach/lib/coach-clients-data";

type CoachClientDetailPageProps = {
  params: Promise<{ clientId: string }>;
};

export function generateStaticParams() {
  return getAllCoachClientIds().map((clientId) => ({ clientId }));
}

export async function generateMetadata({
  params,
}: CoachClientDetailPageProps): Promise<Metadata> {
  const { clientId } = await params;
  const client = getCoachClientDetail(clientId);
  return { title: client?.name ?? "Client" };
}

export default async function CoachClientDetailPage({
  params,
}: CoachClientDetailPageProps) {
  const { clientId } = await params;
  return <CoachClientDetailGate clientId={clientId} />;
}
