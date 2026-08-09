"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Switch, Typography } from "@heroui/react";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Bell1 } from "@repo/icons/Bell1";
import { ChartTrendUp } from "@repo/icons/ChartTrendUp";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ExclamationMarkCircle } from "@repo/icons/ExclamationMarkCircle";
import { GridFour } from "@repo/icons/GridFour";
import { Leaf } from "@repo/icons/Leaf";
import { WaterDrop } from "@repo/icons/WaterDrop";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { ProfileMenuRow } from "@/modules/account/components/ProfileMenuRow";
import { notificationSettingsScreenVariants } from "./NotificationSettingsScreen.styles";
import type { NotificationSettingsScreenProps } from "./NotificationSettingsScreen.types";

const ICON = 22;

export function NotificationSettingsScreen({
  className,
  roleSegment = "athlete",
}: NotificationSettingsScreenProps) {
  const t = useTranslations("Mobile.NotificationSettings");
  const styles = notificationSettingsScreenVariants();
  const router = useRouter();
  const [activity, setActivity] = useState(false);
  const [workout, setWorkout] = useState(true);
  const [hydration, setHydration] = useState(true);
  const [nutrition, setNutrition] = useState(true);
  const [progressTips, setProgressTips] = useState(false);
  const [weekly, setWeekly] = useState(false);

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.push(`/${roleSegment}/profile`)}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <section className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body-sm">
            {t("healthGroup")}
          </Typography>
          <div className={styles.stack()}>
            <ProfileMenuRow
              hint={t("activityHint")}
              icon={<Bell1 size={ICON} />}
              label={t("activityReminder")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("activityReminder")}
                  isSelected={activity}
                  onChange={setActivity}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
            <ProfileMenuRow
              icon={<BarbellHorizontal size={ICON} />}
              label={t("workoutReminder")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("workoutReminder")}
                  isSelected={workout}
                  onChange={setWorkout}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
            <ProfileMenuRow
              hint={t("pushHint")}
              icon={<ExclamationMarkCircle size={ICON} />}
              label={t("pushNotification")}
              onPress={() => router.push(`/${roleSegment}/notifications`)}
            />
            <ProfileMenuRow
              icon={<WaterDrop size={ICON} />}
              label={t("hydrationReminder")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("hydrationReminder")}
                  isSelected={hydration}
                  onChange={setHydration}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
            <ProfileMenuRow
              icon={<Leaf size={ICON} />}
              label={t("nutritionReminder")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("nutritionReminder")}
                  isSelected={nutrition}
                  onChange={setNutrition}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
          </div>
        </section>

        <section className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body-sm">
            {t("insightGroup")}
          </Typography>
          <div className={styles.stack()}>
            <ProfileMenuRow
              icon={<ChartTrendUp size={ICON} />}
              label={t("progressTips")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("progressTips")}
                  isSelected={progressTips}
                  onChange={setProgressTips}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
            <ProfileMenuRow
              hint={t("weeklyHint")}
              icon={<GridFour size={ICON} />}
              label={t("weeklyInsight")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("weeklyInsight")}
                  isSelected={weekly}
                  onChange={setWeekly}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
