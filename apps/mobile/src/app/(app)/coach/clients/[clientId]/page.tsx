import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllCoachClientIds,
  getCoachClientDetail,
} from "@/modules/coach/lib/coach-clients-data";
import { CoachClientDetailScreen } from "@/modules/coach/screens/CoachClientDetailScreen";

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

  if (!client) {
    return { title: "Client" };
  }

  return { title: client.name };
}

export default async function CoachClientDetailPage({
  params,
}: CoachClientDetailPageProps) {
  const { clientId } = await params;
  const client = getCoachClientDetail(clientId);

  if (!client) {
    notFound();
  }

  return <CoachClientDetailScreen client={client} />;
}
