"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type {
  BookingStatus,
  CoachBookingAction,
  CoachBookingRequest,
} from "../../lib/coach-bookings-data";
import { CoachBookingsListSection } from "../../sections/CoachBookingsListSection";
import { coachBookingsScreenVariants } from "./CoachBookingsScreen.styles";
import type { CoachBookingsScreenProps } from "./CoachBookingsScreen.types";

type BookingsTab = "requests" | "upcoming" | "past";

const TABS: BookingsTab[] = ["requests", "upcoming", "past"];

const TAB_LABEL_KEY: Record<BookingsTab, string> = {
  requests: "tabRequests",
  upcoming: "tabUpcoming",
  past: "tabPast",
};

function tabOf(status: BookingStatus): BookingsTab | undefined {
  if (status === "PENDING" || status === "AWAITING_PAYMENT") return "requests";
  if (status === "CONFIRMED" || status === "CHECKED_IN") return "upcoming";
  return "past";
}

export function CoachBookingsScreen({
  bookings,
  onAction,
}: CoachBookingsScreenProps) {
  const t = useTranslations("CoachBookings");
  const router = useRouter();
  const styles = coachBookingsScreenVariants();
  const [tab, setTab] = useState<BookingsTab>("requests");
  const [items, setItems] = useState<CoachBookingRequest[]>(bookings);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(bookings);
  }, [bookings]);

  const visibleItems = useMemo(
    () => items.filter((item) => tabOf(item.status) === tab),
    [items, tab],
  );

  const setStatus = (id: string, status: BookingStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  const runAction = async (id: string, action: CoachBookingAction) => {
    if (!onAction) return;
    setPendingId(id);
    try {
      await onAction(id, action);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <AppLayout
      className={styles.root()}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
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

        <div aria-label={t("tabsLabel")} className={styles.tabs()} role="group">
          {TABS.map((item) => (
            <Button
              className={styles.tabChip()}
              key={item}
              onPress={() => setTab(item)}
              size="sm"
              variant={tab === item ? "primary" : "ghost"}
            >
              {t(TAB_LABEL_KEY[item])}
            </Button>
          ))}
        </div>

        <CoachBookingsListSection
          hasApiActions={Boolean(onAction)}
          items={visibleItems}
          pendingId={pendingId}
          tab={tab}
          onAcceptMock={(id) => setStatus(id, "CONFIRMED")}
          onAction={onAction ? runAction : undefined}
          onRejectMock={(id) => setStatus(id, "REJECTED")}
        />
      </div>
    </AppLayout>
  );
}
