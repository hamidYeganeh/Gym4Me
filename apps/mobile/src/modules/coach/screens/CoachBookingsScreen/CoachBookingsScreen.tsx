"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Chip, Typography } from "@heroui/react";
import { Check } from "@repo/icons/Check";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { CloseX } from "@repo/icons/CloseX";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type {
  BookingStatus,
  CoachBookingAction,
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

const STATUS_CHIP_COLOR: Partial<
  Record<BookingStatus, "success" | "warning" | "danger" | "default">
> = {
  PENDING: "warning",
  AWAITING_PAYMENT: "warning",
  CONFIRMED: "success",
  CHECKED_IN: "success",
  COMPLETED: "success",
  NO_SHOW: "warning",
  CANCELLED: "danger",
  REJECTED: "danger",
  REFUND_REQUESTED: "warning",
  REFUNDED: "default",
};

const STATUS_LABEL_KEY: Partial<Record<BookingStatus, string>> = {
  PENDING: "statusPending",
  AWAITING_PAYMENT: "statusAwaitingPayment",
  CONFIRMED: "statusConfirmed",
  CHECKED_IN: "statusCheckedIn",
  COMPLETED: "statusCompleted",
  NO_SHOW: "statusNoShow",
  CANCELLED: "statusCancelled",
  REJECTED: "statusRejected",
  REFUND_REQUESTED: "statusRefundRequested",
  REFUNDED: "statusRefunded",
};

const ACTION_LABEL_KEY: Record<CoachBookingAction, string> = {
  accept: "actionAccept",
  checkIn: "actionCheckIn",
  complete: "actionComplete",
  noShow: "actionNoShow",
  cancel: "actionCancel",
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
                  <Image
                    alt={booking.clientName}
                    className={styles.avatar}
                    height={48}
                    src={booking.avatar}
                    width={48}
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

                {booking.api && onAction && booking.api.actions.length > 0 ? (
                  <div className={styles.actions}>
                    {booking.api.actions.map((action) => (
                      <Button
                        className={
                          action === "cancel" || action === "noShow"
                            ? styles.rejectButton
                            : styles.acceptButton
                        }
                        isPending={pendingId === booking.id}
                        key={action}
                        onPress={() => void runAction(booking.id, action)}
                        variant={
                          action === "cancel" || action === "noShow"
                            ? "ghost"
                            : "primary"
                        }
                      >
                        {action === "cancel" || action === "noShow" ? (
                          <CloseX size={18} />
                        ) : (
                          <Check size={18} />
                        )}
                        {t(ACTION_LABEL_KEY[action])}
                      </Button>
                    ))}
                  </div>
                ) : !booking.api && booking.status === "PENDING" ? (
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
