"use client";

import { useMemo, useState } from "react";
import { Button, Chip, Typography } from "@heroui/react";
import { Check } from "@repo/icons/Check";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { CloseX } from "@repo/icons/CloseX";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type {
  BookingStatus,
  CoachBookingRequest,
} from "../../lib/coach-bookings-data";
import { coachBookingsScreenStyles as styles } from "./CoachBookingsScreen.styles";
import type { CoachBookingsScreenProps } from "./CoachBookingsScreen.types";

type BookingsTab = "requests" | "upcoming" | "past";

const TABS: BookingsTab[] = ["requests", "upcoming", "past"];

const TAB_LABEL_KEY: Record<BookingsTab, string> = {
  requests: "tabRequests",
  upcoming: "tabUpcoming",
  past: "tabPast",
};

const PAST_STATUSES: BookingStatus[] = ["COMPLETED", "NO_SHOW", "CANCELLED"];

const STATUS_CHIP_COLOR: Partial<
  Record<BookingStatus, "success" | "warning" | "danger" | "default">
> = {
  PENDING: "warning",
  CONFIRMED: "success",
  COMPLETED: "success",
  NO_SHOW: "warning",
  CANCELLED: "danger",
  REJECTED: "danger",
};

const STATUS_LABEL_KEY: Partial<Record<BookingStatus, string>> = {
  PENDING: "statusPending",
  CONFIRMED: "statusConfirmed",
  COMPLETED: "statusCompleted",
  NO_SHOW: "statusNoShow",
  CANCELLED: "statusCancelled",
  REJECTED: "statusRejected",
};

function tabOf(status: BookingStatus): BookingsTab | undefined {
  if (status === "PENDING") return "requests";
  if (status === "CONFIRMED") return "upcoming";
  if (PAST_STATUSES.includes(status)) return "past";
  return undefined;
}

export function CoachBookingsScreen({ bookings }: CoachBookingsScreenProps) {
  const t = useTranslations("CoachBookings");
  const router = useRouter();
  const [tab, setTab] = useState<BookingsTab>("requests");
  const [items, setItems] = useState<CoachBookingRequest[]>(bookings);

  const visibleItems = useMemo(
    () => items.filter((item) => tabOf(item.status) === tab),
    [items, tab],
  );

  const setStatus = (id: string, status: BookingStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

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
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <div aria-label={t("tabsLabel")} className={styles.tabs} role="group">
          {TABS.map((item) => (
            <Button
              className={styles.tabChip}
              key={item}
              onPress={() => setTab(item)}
              size="sm"
              variant={tab === item ? "primary" : "ghost"}
            >
              {t(TAB_LABEL_KEY[item])}
            </Button>
          ))}
        </div>

        {visibleItems.length > 0 ? (
          <div className={styles.list}>
            {visibleItems.map((booking) => (
              <article className={styles.card} key={booking.id}>
                <div className={styles.cardHeader}>
                  <img
                    alt={booking.clientName}
                    className={styles.avatar}
                    src={booking.avatar}
                  />
                  <div className={styles.cardHeaderBody}>
                    <Typography
                      className={styles.clientName}
                      type="body"
                      weight="semibold"
                    >
                      {booking.clientName}
                    </Typography>
                    <Typography className={styles.typeLabel} type="body-sm">
                      {booking.typeLabel}
                    </Typography>
                  </div>
                  <Chip
                    color={STATUS_CHIP_COLOR[booking.status] ?? "default"}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>
                      {t(STATUS_LABEL_KEY[booking.status] ?? "statusPending")}
                    </Chip.Label>
                  </Chip>
                </div>

                <div className={styles.metaRow}>
                  <Typography className={styles.metaItem} type="body-sm">
                    {booking.dateLabel}
                  </Typography>
                  <Typography className={styles.metaItem} type="body-sm">
                    {booking.timeLabel}
                  </Typography>
                  <Typography
                    className={styles.price}
                    type="body-sm"
                    weight="semibold"
                  >
                    {booking.priceLabel}
                  </Typography>
                </div>

                {booking.status === "CONFIRMED" && booking.checkInCode ? (
                  <Typography className={styles.checkInHint} type="body-sm">
                    {t("checkInHint", { code: booking.checkInCode })}
                  </Typography>
                ) : null}

                {booking.status === "PENDING" ? (
                  <div className={styles.actions}>
                    <Button
                      className={styles.acceptButton}
                      onPress={() => setStatus(booking.id, "CONFIRMED")}
                      variant="primary"
                    >
                      <Check size={18} />
                      {t("accept")}
                    </Button>
                    <Button
                      className={styles.rejectButton}
                      onPress={() => setStatus(booking.id, "REJECTED")}
                      variant="ghost"
                    >
                      <CloseX size={18} />
                      {t("reject")}
                    </Button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Typography
              className={styles.emptyTitle}
              type="h4"
              weight="semibold"
            >
              {t(`empty_${tab}_title`)}
            </Typography>
            <Typography className={styles.emptyBody} type="body-sm">
              {t(`empty_${tab}_body`)}
            </Typography>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
