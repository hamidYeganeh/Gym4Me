"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useRouter } from "next/navigation";
import { useAthleteGoals } from "@/modules/athlete/lib/use-athlete-goals";
import { AthleteGoalsCreateSection } from "@/modules/athlete/sections/AthleteGoalsCreateSection";
import { AthleteGoalsIntroSection } from "@/modules/athlete/sections/AthleteGoalsIntroSection";
import { AthleteGoalsListSection } from "@/modules/athlete/sections/AthleteGoalsListSection";
import { AthleteGoalsReminderSection } from "@/modules/athlete/sections/AthleteGoalsReminderSection";
import { athleteGoalsScreenVariants } from "./AthleteGoalsScreen.styles";
import type { AthleteGoalsScreenProps } from "./AthleteGoalsScreen.types";

export function AthleteGoalsScreen(props: AthleteGoalsScreenProps) {
  const router = useRouter();
  const styles = athleteGoalsScreenVariants();
  const goals = useAthleteGoals(props);

  return (
    <AppLayout
      className={styles.root()}
      header={
        <Header
          startContent={
            <Button
              aria-label="بازگشت"
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <AthleteGoalsIntroSection />

        <AthleteGoalsCreateSection
          metricKey={goals.metricKey}
          metricOptions={goals.metricOptions}
          onMetricKeyChange={goals.setMetricKey}
          onOperatorChange={goals.setOperator}
          onPeriodChange={goals.setPeriod}
          onSubmit={goals.submitGoal}
          onTargetValueChange={goals.setTargetValue}
          operator={goals.operator}
          pending={goals.pending}
          period={goals.period}
          targetValue={goals.targetValue}
        />

        <AthleteGoalsListSection
          goals={props.goals}
          onUpdateGoalStatus={goals.onUpdateGoalStatus}
          pending={goals.pending}
        />

        <AthleteGoalsReminderSection
          enableReminder={goals.enableReminder}
          localTime={goals.localTime}
          metricOptions={goals.metricOptions}
          onEnableReminderChange={goals.setEnableReminder}
          onLocalTimeChange={goals.setLocalTime}
          onQuietEndChange={goals.setQuietEnd}
          onQuietStartChange={goals.setQuietStart}
          onReminderKeyChange={goals.setReminderKey}
          onSubmit={goals.submitReminder}
          pending={goals.pending}
          quietEnd={goals.quietEnd}
          quietStart={goals.quietStart}
          reminderKey={goals.reminderKey}
          reminders={props.reminders}
        />

        {goals.message ? (
          <Typography className={styles.feedback()} type="body-sm">
            {goals.message}
          </Typography>
        ) : null}
        {goals.error ? (
          <Typography className={styles.error()} type="body-sm">
            {goals.error}
          </Typography>
        ) : null}
      </div>
    </AppLayout>
  );
}
