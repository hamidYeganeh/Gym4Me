import type { Metadata } from "next";
import { DiscoverySlotDetailGate } from "@/modules/discovery/lib/DiscoverySlotDetailGate";
import {
  getAllSlotParams,
  getSlotDetail,
} from "@/modules/discovery/lib/slot-detail-data";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type SlotDetailPageProps = {
  params: Promise<{ clubId: string; slotId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(getAllSlotParams, [
    {
      clubId: STATIC_EXPORT_PLACEHOLDER_ID,
      slotId: STATIC_EXPORT_PLACEHOLDER_ID,
    },
  ]);
}

export async function generateMetadata({
  params,
}: SlotDetailPageProps): Promise<Metadata> {
  const { clubId, slotId } = await params;
  const slotDetail =
    canUseDemoFixtureId(clubId) && canUseDemoFixtureId(slotId)
      ? getSlotDetail(clubId, slotId)
      : undefined;

  if (!slotDetail) {
    return { title: "Slot" };
  }

  return { title: slotDetail.title };
}

export default async function SlotDetailPage({ params }: SlotDetailPageProps) {
  const { clubId, slotId } = await params;

  return <DiscoverySlotDetailGate clubId={clubId} slotId={slotId} />;
}
