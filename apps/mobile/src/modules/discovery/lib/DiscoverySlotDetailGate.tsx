"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { DiscoveryClubsSlotDetailScreen } from "../screens/DiscoveryClubsSlotDetailScreen";
import { useDiscoverySlotDetail } from "./use-discovery-slot-detail";

type Props = {
  clubId: string;
  slotId: string;
};

/** Client gate: server pages pass only ids (render props are not RSC-serializable). */
export function DiscoverySlotDetailGate({ clubId, slotId }: Props) {
  const t = useTranslations("ClubSlotDetail");
  const { slotDetail, isLoading } = useDiscoverySlotDetail(clubId, slotId);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!slotDetail) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          {t("notFound")}
        </Typography>
      </div>
    );
  }

  return <DiscoveryClubsSlotDetailScreen slotDetail={slotDetail} />;
}
