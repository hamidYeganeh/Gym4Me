"use client";

import { Button } from "@heroui/react/button";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useEffect, useMemo, useState } from "react";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import type { CoachSlotView } from "@/shared/hooks/useCoachSlotsWeek";
import {
  addDaysIso,
  formatJalaliDateShort,
  formatJalaliRangeLabel,
  todayIso,
  weekRangeContaining,
} from "../../lib/club-calendar-data";
import { useDiscoveryCoachSlotsWeek } from "../../lib/use-discovery-coach-slots";
import { DiscoveryCoachesSlotsCoachSection } from "../../sections/DiscoveryCoachesSlotsCoachSection";
import { DiscoveryCoachesSlotsFooterSection } from "../../sections/DiscoveryCoachesSlotsFooterSection";
import { DiscoveryCoachesSlotsScheduleSection } from "../../sections/DiscoveryCoachesSlotsScheduleSection";
import { discoveryCoachesSlotsScreenVariants } from "./DiscoveryCoachesSlotsScreen.styles";
import type { DiscoveryCoachesSlotsScreenProps } from "./DiscoveryCoachesSlotsScreen.types";

export function DiscoveryCoachesSlotsScreen({
  coach,
}: DiscoveryCoachesSlotsScreenProps) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const { runWithAuth } = useRequireAuthAction();
  const styles = discoveryCoachesSlotsScreenVariants();
  const today = useMemo(() => todayIso(), []);
  const [anchor, setAnchor] = useState(today);

  const range = weekRangeContaining(anchor);
  const { days } = useDiscoveryCoachSlotsWeek(coach.id, range.from);

  const firstAvailableId = useMemo(() => {
    for (const day of days) {
      const slot = day.slots.find((entry) => entry.status === "available");
      if (slot) return slot.id;
    }
    return undefined;
  }, [days]);

  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(
    firstAvailableId,
  );

  useEffect(() => {
    setSelectedSlotId(firstAvailableId);
  }, [firstAvailableId]);

  const selected = useMemo(() => {
    for (const day of days) {
      const slot = day.slots.find((entry) => entry.id === selectedSlotId);
      if (slot && slot.status === "available") return { day, slot };
    }
    return null;
  }, [days, selectedSlotId]);

  const goWeek = (delta: number) => {
    setAnchor(addDaysIso(range.from, delta * 7));
  };

  const selectionSummary = selected
    ? t("slotsYouSelected", {
        date: formatJalaliDateShort(selected.day.date),
        time: selected.slot.timeLabel,
      })
    : t("slotsSelectPrompt");

  const onSlotPress = (slot: CoachSlotView) => {
    if (slot.status === "unavailable") return;
    setSelectedSlotId(slot.id);
  };

  const onBook = () => {
    if (!selected) return;
    const reserveHref = `/discovery/coaches/${coach.id}/reserve?slotId=${encodeURIComponent(selected.slot.id)}`;
    runWithAuth(() => router.push(reserveHref), reserveHref);
  };

  return (
    <AppLayout
      className={styles.root()}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          endContent={
            <Button
              aria-label={t("slotsOpenCalendar")}
              className="relative"
              isIconOnly
              size="lg"
              variant="ghost"
            >
              <Calendar1 className="text-foreground" size={22} />
              <span aria-hidden className={styles.calendarBadge()} />
            </Button>
          }
        />
      }
    >
      <div className={styles.main()}>
        <DiscoveryCoachesSlotsCoachSection coach={coach} />
        <DiscoveryCoachesSlotsScheduleSection
          days={days}
          onNextWeek={() => goWeek(1)}
          onPrevWeek={() => goWeek(-1)}
          onSlotPress={onSlotPress}
          selectedSlotId={selectedSlotId}
          today={today}
          weekLabel={formatJalaliRangeLabel(range.from, range.to)}
        />
      </div>

      <DiscoveryCoachesSlotsFooterSection
        canBook={Boolean(selected)}
        onBook={onBook}
        selectionSummary={selectionSummary}
      />
    </AppLayout>
  );
}
