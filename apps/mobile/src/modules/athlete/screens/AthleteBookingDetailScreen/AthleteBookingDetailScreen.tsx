"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAthleteBookingDetail } from "@/modules/athlete/lib/use-athlete-booking-detail";
import { AthleteBookingDetailActionsSection } from "@/modules/athlete/sections/AthleteBookingDetailActionsSection";
import { AthleteBookingDetailSummarySection } from "@/modules/athlete/sections/AthleteBookingDetailSummarySection";
import { AthleteBookingDetailTimelineSection } from "@/modules/athlete/sections/AthleteBookingDetailTimelineSection";
import { getBookingStatusColor } from "../AthleteBookingsScreen";
import { athleteBookingDetailScreenStyles as styles } from "./AthleteBookingDetailScreen.styles";
import type { AthleteBookingDetailScreenProps } from "./AthleteBookingDetailScreen.types";

export function AthleteBookingDetailScreen(props: AthleteBookingDetailScreenProps) {
  const t = useTranslations("AthleteBookingDetail");
  const tBookings = useTranslations("AthleteBookings");
  const router = useRouter();
  const detail = useAthleteBookingDetail(props);

  const backButton = (
    <Button
      aria-label={t("back")}
      isIconOnly
      onPress={() => router.back()}
      size="lg"
      variant="ghost"
    >
      <ChevronLeft className="text-foreground" size={22} />
    </Button>
  );

  if (!detail.booking) {
    return (
      <AppLayout
        className={styles.root}
        header={<Header startContent={backButton} />}
      >
        <div className={styles.content}>
          <div className={styles.empty}>
            <Typography
              className={styles.emptyTitle}
              type="h4"
              weight="semibold"
            >
              {t("notFound")}
            </Typography>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      className={styles.root}
      header={<Header startContent={backButton} />}
    >
      <div className={styles.content}>
        <AthleteBookingDetailSummarySection
          {...detail}
          statusColor={getBookingStatusColor(detail.booking.status)}
          statusLabel={tBookings(`status.${detail.booking.status}`)}
        />

        <AthleteBookingDetailTimelineSection
          currentStepIndex={detail.currentStepIndex}
          t={detail.t}
        />

        <AthleteBookingDetailActionsSection {...detail} />
      </div>
    </AppLayout>
  );
}
