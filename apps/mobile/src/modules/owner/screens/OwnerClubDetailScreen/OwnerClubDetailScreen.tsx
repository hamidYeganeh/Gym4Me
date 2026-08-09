"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Plus } from "@repo/icons/Plus";
import { statsColors } from "@repo/theme";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ownerClubDetailScreenStyles as styles } from "./OwnerClubDetailScreen.styles";
import type {
  OwnerClubDetailScreenProps,
  OwnerClubDetailTabId,
} from "./OwnerClubDetailScreen.types";

const TABS = [
  { id: "overview", labelKey: "tabOverview" },
  { id: "branches", labelKey: "tabBranches" },
  { id: "classes", labelKey: "tabClasses" },
  { id: "slots", labelKey: "tabSlots" },
] as const satisfies readonly {
  id: OwnerClubDetailTabId;
  labelKey: string;
}[];

const TODAY_LABEL_KEY = {
  "check-ins": "todayCheckIns",
  "new-members": "todayNewMembers",
  bookings: "todayBookings",
} as const;

export function OwnerClubDetailScreen({
  club,
  className,
}: OwnerClubDetailScreenProps) {
  const t = useTranslations("OwnerClubDetail");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OwnerClubDetailTabId>("overview");

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
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
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {club.name}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {club.city}
          </Typography>
        </section>

        <div aria-label={t("tabsLabel")} className={styles.tabs} role="group">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              className={styles.tabChip}
              onPress={() => setActiveTab(tab.id)}
              size="sm"
              variant={activeTab === tab.id ? "primary" : "ghost"}
            >
              {t(tab.labelKey)}
            </Button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <>
            <div className={styles.statsGrid}>
              <StatsCard
                chart="line"
                color={statsColors.blue}
                comparisonSeries={club.revenueComparisonSeries}
                series={club.revenueSeries}
                title={t("revenueTitle")}
                unit={t("revenueUnit")}
                value={club.revenueValue}
              />
              <StatsCard
                chart="bar"
                color={statsColors.orange}
                series={club.attendanceSeries}
                title={t("attendanceTitle")}
                unit={t("attendanceUnit")}
                value={club.attendanceValue}
              />
            </div>

            <div className={styles.chartCard}>
              <Typography
                className={styles.chartTitle}
                type="body"
                weight="semibold"
              >
                {t("occupancyTrendTitle")}
              </Typography>
              <AreaLineChart
                aria-label={t("occupancyTrendTitle")}
                className={styles.chart}
                data={club.occupancyTrend}
              />
            </div>

            <section className={styles.section}>
              <Typography
                className={styles.sectionTitle}
                type="h4"
                weight="semibold"
              >
                {t("todayTitle")}
              </Typography>
              <div className={styles.groupCard}>
                {club.today.map((row, index) => (
                  <div key={row.id}>
                    <div className={styles.row}>
                      <span className={styles.rowBody}>
                        <Typography
                          className={styles.rowLabel}
                          type="body"
                          weight="medium"
                        >
                          {t(TODAY_LABEL_KEY[row.id])}
                        </Typography>
                      </span>
                      <span className={styles.rowValue}>{row.value}</span>
                    </div>
                    {index < club.today.length - 1 ? (
                      <div aria-hidden className={styles.divider} />
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "branches" ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Typography
                className={styles.sectionTitle}
                type="h4"
                weight="semibold"
              >
                {t("branchesTitle")}
              </Typography>
              <Button size="sm" variant="ghost">
                <Plus aria-hidden size={16} />
                {t("addBranch")}
              </Button>
            </div>
            <div className={styles.groupCard}>
              {club.branches.map((branch, index) => (
                <div key={branch.id}>
                  <div className={styles.row}>
                    <span className={styles.rowBody}>
                      <Typography
                        className={styles.rowLabel}
                        type="body"
                        weight="medium"
                      >
                        {branch.name}
                      </Typography>
                      <Typography className={styles.rowHint} type="body-sm">
                        {branch.address}
                      </Typography>
                      <Typography className={styles.rowHint} type="body-sm">
                        {branch.capacityLabel}
                      </Typography>
                    </span>
                    <Chip
                      color={branch.state === "active" ? "success" : "warning"}
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>
                        {branch.state === "active"
                          ? t("branchStateActive")
                          : t("branchStateMaintenance")}
                      </Chip.Label>
                    </Chip>
                  </div>
                  {index < club.branches.length - 1 ? (
                    <div aria-hidden className={styles.divider} />
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "classes" ? (
          <section className={styles.section}>
            <Typography
              className={styles.sectionTitle}
              type="h4"
              weight="semibold"
            >
              {t("classesTitle")}
            </Typography>
            <div className={styles.groupCard}>
              {club.classes.map((classItem, index) => {
                const fillPercent = Math.min(
                  Math.round((classItem.enrolled / classItem.capacity) * 100),
                  100,
                );

                return (
                  <div key={classItem.id}>
                    <div className={styles.row}>
                      <span className={styles.rowBody}>
                        <Typography
                          className={styles.rowLabel}
                          type="body"
                          weight="medium"
                        >
                          {classItem.title}
                        </Typography>
                        <Typography className={styles.rowHint} type="body-sm">
                          {classItem.coach} · {classItem.scheduleLabel}
                        </Typography>
                        <span className={styles.progress}>
                          <span className={styles.progressRow}>
                            <Typography
                              className={styles.progressLabel}
                              type="body-sm"
                            >
                              {t("enrolledLabel")}
                            </Typography>
                            <span className={styles.progressValue}>
                              {classItem.enrolled}/{classItem.capacity}
                            </span>
                          </span>
                          <span aria-hidden className={styles.progressTrack}>
                            <span
                              className={styles.progressFill}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </span>
                        </span>
                      </span>
                      <Chip
                        color={
                          classItem.state === "active" ? "success" : "warning"
                        }
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>
                          {classItem.state === "active"
                            ? t("classStateActive")
                            : t("classStatePaused")}
                        </Chip.Label>
                      </Chip>
                    </div>
                    {index < club.classes.length - 1 ? (
                      <div aria-hidden className={styles.divider} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeTab === "slots" ? (
          <section className={styles.section}>
            <div>
              <Typography
                className={styles.sectionTitle}
                type="h4"
                weight="semibold"
              >
                {t("slotsTitle")}
              </Typography>
              <Typography className={styles.rowHint} type="body-sm">
                {t("slotsHint")}
              </Typography>
            </div>
            <div className={styles.groupCard}>
              {club.slotDays.map((day, index) => (
                <div key={day.id}>
                  <div className={styles.row}>
                    <span className={styles.rowBody}>
                      <Typography
                        className={styles.rowLabel}
                        type="body"
                        weight="medium"
                      >
                        {day.dayLabel}
                      </Typography>
                      <Typography className={styles.rowHint} type="body-sm">
                        {day.peakHoursLabel}
                      </Typography>
                    </span>
                    <span className={styles.rowValue}>
                      {day.slotCountLabel}
                    </span>
                  </div>
                  {index < club.slotDays.length - 1 ? (
                    <div aria-hidden className={styles.divider} />
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppLayout>
  );
}
