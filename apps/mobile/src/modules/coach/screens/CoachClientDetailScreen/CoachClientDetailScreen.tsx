"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CoachClientDetailActionsSection } from "../../sections/CoachClientDetailActionsSection";
import { CoachClientDetailHeroSection } from "../../sections/CoachClientDetailHeroSection";
import { CoachClientDetailNotesSection } from "../../sections/CoachClientDetailNotesSection";
import { CoachClientDetailSessionsSection } from "../../sections/CoachClientDetailSessionsSection";
import { CoachClientDetailStatsSection } from "../../sections/CoachClientDetailStatsSection";
import { CoachClientDetailTrendSection } from "../../sections/CoachClientDetailTrendSection";
import { coachClientDetailScreenStyles as styles } from "./CoachClientDetailScreen.styles";
import type { CoachClientDetailScreenProps } from "./CoachClientDetailScreen.types";

export function CoachClientDetailScreen({
  client,
  messaging = false,
  onSendMessage,
}: CoachClientDetailScreenProps) {
  const t = useTranslations("CoachClientDetail");
  const router = useRouter();
  const [sessionLogged, setSessionLogged] = useState(false);

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className={styles.content}>
        <CoachClientDetailHeroSection client={client} />
        <CoachClientDetailTrendSection trendPoints={client.trendPoints} />
        <CoachClientDetailStatsSection
          adherenceSeries={client.adherenceSeries}
          adherenceValue={client.adherenceValue}
          monthlySessionsSeries={client.monthlySessionsSeries}
          monthlySessionsValue={client.monthlySessionsValue}
        />
        <CoachClientDetailSessionsSection
          emptyMessage={t("upcomingEmpty")}
          sessions={client.upcomingSessions}
          title={t("upcomingTitle")}
        />
        <CoachClientDetailSessionsSection
          sessions={client.sessionHistory}
          title={t("historyTitle")}
        />
        <CoachClientDetailNotesSection note={client.note} />
        <CoachClientDetailActionsSection
          messaging={messaging}
          onLogSession={() => setSessionLogged(true)}
          onSendMessage={onSendMessage}
          sessionLogged={sessionLogged}
        />
      </div>
    </AppLayout>
  );
}
