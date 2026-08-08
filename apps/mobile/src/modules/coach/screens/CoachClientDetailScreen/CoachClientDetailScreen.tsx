"use client";

import { useState } from "react";
import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type {
  CoachClientEngagement,
  CoachClientSession,
} from "../../lib/coach-clients-data";
import { coachClientDetailScreenStyles as styles } from "./CoachClientDetailScreen.styles";
import type { CoachClientDetailScreenProps } from "./CoachClientDetailScreen.types";

const ENGAGEMENT_CHIP_COLOR: Record<
  CoachClientEngagement,
  "success" | "warning" | "default"
> = {
  active: "success",
  "at-risk": "warning",
  paused: "default",
};

const ENGAGEMENT_LABEL_KEY: Record<CoachClientEngagement, string> = {
  active: "engagementActive",
  "at-risk": "engagementAtRisk",
  paused: "engagementPaused",
};

const SESSION_STATUS_CHIP_COLOR: Record<
  CoachClientSession["status"],
  "success" | "warning" | "danger" | "default"
> = {
  COMPLETED: "success",
  CONFIRMED: "success",
  CANCELLED: "danger",
  NO_SHOW: "warning",
};

const SESSION_STATUS_LABEL_KEY: Record<CoachClientSession["status"], string> = {
  COMPLETED: "statusCompleted",
  CONFIRMED: "statusConfirmed",
  CANCELLED: "statusCancelled",
  NO_SHOW: "statusNoShow",
};

export function CoachClientDetailScreen({
  client,
}: CoachClientDetailScreenProps) {
  const t = useTranslations("CoachClientDetail");
  const router = useRouter();
  const [sessionLogged, setSessionLogged] = useState(false);

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          className="border-b-0 bg-background"
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
        <section className={styles.hero}>
          <img
            alt={client.name}
            className={styles.heroAvatar}
            src={client.avatar}
          />
          <Typography className={styles.heroName} type="h1" weight="bold">
            {client.name}
          </Typography>
          <Typography className={styles.heroMeta} type="body-sm">
            {t("heroMeta", {
              goal: client.goalLabel,
              level: client.levelLabel,
            })}
          </Typography>
          <div className={styles.heroChips}>
            <Chip
              color={ENGAGEMENT_CHIP_COLOR[client.engagement]}
              size="sm"
              variant="soft"
            >
              <Chip.Label>
                {t(ENGAGEMENT_LABEL_KEY[client.engagement])}
              </Chip.Label>
            </Chip>
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("trendTitle")}
          </Typography>
          <div className={styles.chartCard}>
            <AreaLineChart
              aria-label={t("trendChartLabel")}
              data={client.trendPoints}
            />
          </div>
        </section>

        <section className={styles.statsGrid}>
          <StatsCard
            chart="bar"
            color="var(--stats-purple)"
            series={client.monthlySessionsSeries}
            title={t("statSessions")}
            value={client.monthlySessionsValue}
            unit={t("statSessionsUnit")}
          />
          <StatsCard
            chart="line"
            color="var(--stats-blue)"
            series={client.adherenceSeries}
            title={t("statAdherence")}
            value={client.adherenceValue}
            unit={t("statAdherenceUnit")}
          />
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("upcomingTitle")}
          </Typography>
          <div className={styles.groupCard}>
            {client.upcomingSessions.length > 0 ? (
              client.upcomingSessions.map((session) => (
                <div key={session.id}>
                  <div className={styles.row}>
                    <div className={styles.rowBody}>
                      <Typography
                        className={styles.rowTitle}
                        type="body"
                        weight="semibold"
                      >
                        {session.typeLabel}
                      </Typography>
                      <Typography className={styles.rowMeta} type="body-sm">
                        {session.dateLabel}
                      </Typography>
                    </div>
                    <Chip
                      color={SESSION_STATUS_CHIP_COLOR[session.status]}
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>
                        {t(SESSION_STATUS_LABEL_KEY[session.status])}
                      </Chip.Label>
                    </Chip>
                  </div>
                  <div className={styles.divider} />
                </div>
              ))
            ) : (
              <Typography className={styles.emptyRow} type="body-sm">
                {t("upcomingEmpty")}
              </Typography>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("historyTitle")}
          </Typography>
          <div className={styles.groupCard}>
            {client.sessionHistory.map((session) => (
              <div key={session.id}>
                <div className={styles.row}>
                  <div className={styles.rowBody}>
                    <Typography
                      className={styles.rowTitle}
                      type="body"
                      weight="semibold"
                    >
                      {session.typeLabel}
                    </Typography>
                    <Typography className={styles.rowMeta} type="body-sm">
                      {session.dateLabel}
                    </Typography>
                  </div>
                  <Chip
                    color={SESSION_STATUS_CHIP_COLOR[session.status]}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>
                      {t(SESSION_STATUS_LABEL_KEY[session.status])}
                    </Chip.Label>
                  </Chip>
                </div>
                <div className={styles.divider} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("notesTitle")}
          </Typography>
          <div className={styles.noteCard}>
            <Typography className={styles.noteBody} type="body-sm">
              {client.note}
            </Typography>
          </div>
        </section>

        <section className={styles.actions}>
          <Button
            fullWidth
            isDisabled={sessionLogged}
            onPress={() => setSessionLogged(true)}
            variant="primary"
          >
            {sessionLogged ? t("logSessionDone") : t("logSession")}
          </Button>
          <Button fullWidth onPress={() => undefined} variant="ghost">
            {t("sendMessage")}
          </Button>
        </section>
      </div>
    </AppLayout>
  );
}
