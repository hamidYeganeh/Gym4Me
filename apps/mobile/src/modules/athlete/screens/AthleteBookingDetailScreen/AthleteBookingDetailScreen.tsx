"use client";

import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
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

  const header = (
    <SecondaryPageHeader
      backAriaLabel={t("back")}
      onBack={() => router.back()}
      title={detail.booking ? t("title") : undefined}
    />
  );

  if (!detail.booking) {
    return (
      <AppLayout className={styles.root} header={header}>
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
    <AppLayout className={styles.root} header={header}>
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
