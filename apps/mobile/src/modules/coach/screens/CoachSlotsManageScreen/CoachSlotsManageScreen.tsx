"use client";

import { Button } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useRouter } from "next/navigation";
import {
  COACH_SLOT_DURATIONS_MINUTES,
  COACH_SLOT_START_TIMES,
} from "@/modules/coach/lib/coach-slots-helpers";
import { useCoachSlotsManage } from "@/modules/coach/lib/use-coach-slots-manage";
import { CoachSlotsManageCreateFormSection } from "@/modules/coach/sections/CoachSlotsManageCreateFormSection";
import { CoachSlotsManageDaysSection } from "@/modules/coach/sections/CoachSlotsManageDaysSection";
import { CoachSlotsManageIntroSection } from "@/modules/coach/sections/CoachSlotsManageIntroSection";
import { CoachSlotsManageWeekNavSection } from "@/modules/coach/sections/CoachSlotsManageWeekNavSection";
import { faDigits, formatTimeFa } from "@/shared/lib/booking-view";
import { addDaysIso, formatJalaliRangeLabel } from "@/shared/lib/week-calendar";
import { coachSlotsManageScreenStyles as styles } from "./CoachSlotsManageScreen.styles";

export function CoachSlotsManageScreen() {
  const router = useRouter();
  const slots = useCoachSlotsManage();

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          startContent={
            <Button
              aria-label={slots.t("back")}
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
        <CoachSlotsManageIntroSection
          subtitle={slots.t("subtitle")}
          title={slots.t("title")}
        />

        <CoachSlotsManageCreateFormSection
          clubs={slots.clubs}
          createSlotLabel={slots.t("createSlot")}
          dayLabel={slots.t("dayLabel")}
          days={slots.days.map((day) => ({
            date: day.date,
            label: slots.dayLabel(day.date),
          }))}
          draftClubId={slots.draftClubId}
          draftDate={slots.draftDate}
          draftDuration={slots.draftDuration}
          draftTime={slots.draftTime}
          durations={COACH_SLOT_DURATIONS_MINUTES}
          error={slots.error}
          formatDuration={(minutes) => slots.t("durationMinutes", { minutes })}
          formatTime={faDigits}
          isCreating={slots.isCreating}
          noClubsHint={slots.t("noClubsHint")}
          onCreate={slots.onCreate}
          onDraftClubIdChange={slots.setDraftClubId}
          onDraftDateChange={slots.setDraftDate}
          onDraftDurationChange={slots.setDraftDuration}
          onDraftTimeChange={slots.setDraftTime}
          startTimes={COACH_SLOT_START_TIMES}
          timeLabel={slots.t("timeLabel")}
          title={slots.t("newSlotTitle")}
          venueLabel={slots.t("venueLabel")}
          venueRemoteLabel={slots.t("venueRemote")}
          durationLabel={slots.t("durationLabel")}
        />

        <CoachSlotsManageWeekNavSection
          nextWeekLabel={slots.t("nextWeek")}
          onNextWeek={() => slots.setAnchor(addDaysIso(slots.range.from, 7))}
          onPrevWeek={() => slots.setAnchor(addDaysIso(slots.range.from, -7))}
          prevWeekLabel={slots.t("prevWeek")}
          rangeLabel={formatJalaliRangeLabel(slots.range.from, slots.range.to)}
        />

        <CoachSlotsManageDaysSection
          days={slots.days.map((day) => ({
            date: day.date,
            label: slots.dayLabel(day.date),
            slots: day.slots,
          }))}
          emptyDayLabel={slots.t("emptyDay")}
          formatSlotTime={formatTimeFa}
          loading={slots.slots === null}
          onRemoveSlot={slots.onRemove}
          removeSlotLabel={slots.t("removeSlot")}
        />
      </div>
    </AppLayout>
  );
}
