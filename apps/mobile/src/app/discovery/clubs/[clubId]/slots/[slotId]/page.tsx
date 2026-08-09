import type { Metadata } from "next";
import { DiscoverySlotDetailGate } from "@/modules/discovery/lib/DiscoverySlotDetailGate";
import {
  getAllSlotParams,
  getSlotDetail,
} from "@/modules/discovery/lib/slot-detail-data";

type SlotDetailPageProps = {
  params: Promise<{ clubId: string; slotId: string }>;
};

export function generateStaticParams() {
  return getAllSlotParams();
}

export async function generateMetadata({
  params,
}: SlotDetailPageProps): Promise<Metadata> {
  const { clubId, slotId } = await params;
  const slotDetail = getSlotDetail(clubId, slotId);

  if (!slotDetail) {
    return { title: "Slot" };
  }

  return { title: slotDetail.title };
}

export default async function SlotDetailPage({
  params,
}: SlotDetailPageProps) {
  const { clubId, slotId } = await params;

  return <DiscoverySlotDetailGate clubId={clubId} slotId={slotId} />;
}
