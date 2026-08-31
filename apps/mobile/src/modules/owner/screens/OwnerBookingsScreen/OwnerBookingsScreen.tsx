"use client";

import { AlertDialog } from "@heroui/react/alert-dialog";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/shared/lib/app-router";
import type { OwnerBookingView } from "../../lib/owner-bookings-data";
import { ownerBookingsScreenVariants } from "./OwnerBookingsScreen.styles";
import {
  OWNER_BOOKING_STATUS_COLORS,
  type OwnerBookingAction,
  type OwnerBookingsFilter,
  type OwnerBookingsScreenProps,
} from "./OwnerBookingsScreen.types";

const FILTERS: OwnerBookingsFilter[] = ["active", "past", "cancelled", "all"];

export function OwnerBookingsScreen(props: OwnerBookingsScreenProps) {
  const {
    bookings, clubs, selectedClubId, filter, search, loading, loadingMore,
    pendingBookingId, error, hasMore, occurrenceOptions = [], occurrencesLoading,
    onClubChange,
    onFilterChange, onSearchChange, onRetry, onLoadMore, onAction,
    onReschedule, className,
  } = props;
  const t = useTranslations("OwnerBookings");
  const router = useRouter();
  const styles = ownerBookingsScreenVariants();
  const [confirming, setConfirming] = useState<{
    booking: OwnerBookingView;
    action: OwnerBookingAction;
  } | null>(null);
  const [rescheduling, setRescheduling] = useState<OwnerBookingView | null>(null);
  const [occurrence, setOccurrence] = useState("");

  const requestAction = (booking: OwnerBookingView, action: OwnerBookingAction) => {
    if (action === "check-in" || action === "complete") {
      void onAction?.(booking, action);
      return;
    }
    setConfirming({ booking, action });
  };

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
      header={<SecondaryPageHeader backAriaLabel={t("back")} onBack={() => router.back()} title={t("title")} />}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">{t("title")}</Typography>
          <Typography className={styles.introSubtitle()} type="body">{t("subtitle")}</Typography>
        </section>

        <section className={styles.toolbar()}>
          {clubs.length > 1 ? (
            <TextField>
              <Label>{t("clubLabel")}</Label>
              <select className={styles.select()} value={selectedClubId} onChange={(event) => onClubChange(event.target.value)}>
                {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
              </select>
            </TextField>
          ) : null}
          <TextField>
            <Label>{t("searchLabel")}</Label>
            <Input placeholder={t("searchPlaceholder")} value={search} onChange={(event) => onSearchChange(event.target.value)} />
          </TextField>
          <div aria-label={t("filtersLabel")} className={styles.filters()} role="group">
            {FILTERS.map((item) => (
              <Button key={item} className={styles.filter()} size="lg" variant={filter === item ? "primary" : "ghost"} onPress={() => onFilterChange(item)}>
                {t(`filter.${item}`)}
              </Button>
            ))}
          </div>
        </section>

        {error ? <div className={styles.error()} role="alert">{error}</div> : null}

        {loading ? (
          <div aria-busy="true" className={styles.empty()}>{t("loading")}</div>
        ) : bookings.length === 0 ? (
          <div className={styles.empty()}>
            <Typography type="h4" weight="semibold">{t("emptyTitle")}</Typography>
            <Typography className={styles.meta()} type="body-sm">{t("emptyBody")}</Typography>
            {error && onRetry ? <Button variant="secondary" onPress={onRetry} size="lg">{t("retry")}</Button> : null}
          </div>
        ) : (
          <section aria-label={t("listLabel")} className={styles.list()}>
            {bookings.map((booking) => {
              const pending = pendingBookingId === booking.id;
              const cancellable = ["pending", "awaiting_payment", "confirmed"].includes(booking.status);
              const operational = ["confirmed", "checked_in"].includes(booking.status);
              return (
                <article className={styles.card()} key={booking.id}>
                  <div className={styles.cardTop()}>
                    <div className={styles.identity()}>
                      <Typography className={styles.title()} type="body" weight="semibold">{booking.athleteName}</Typography>
                      <Typography className={styles.meta()} type="body-sm">{booking.athletePhone} · {t(`holder.${booking.holderType}`)}</Typography>
                    </div>
                    <Chip color={OWNER_BOOKING_STATUS_COLORS[booking.status]} size="sm" variant="soft"><Chip.Label>{t(`status.${booking.status}`)}</Chip.Label></Chip>
                  </div>
                  <div className={styles.facts()}>
                    <div className={styles.fact()}><span className={styles.factLabel()}>{t("resource")}</span><span className={styles.factValue()}>{booking.resourceTitle}</span></div>
                    <div className={styles.fact()}><span className={styles.factLabel()}>{t("date")}</span><span className={styles.factValue()}>{booking.startsAtLabel}</span></div>
                    <div className={styles.fact()}><span className={styles.factLabel()}>{t("code")}</span><span className={styles.factValue()} dir="ltr">{booking.code}</span></div>
                    <div className={styles.fact()}><span className={styles.factLabel()}>{t("payment")}</span><span className={styles.factValue()}>{booking.totalLabel} · {booking.paid ? t("paid") : t("unpaid")}</span></div>
                  </div>
                  {booking.note ? <div className={styles.note()}>{booking.note}</div> : null}
                  {(operational || cancellable) && onAction ? (
                    <div className={styles.actions()}>
                      {booking.status === "confirmed" ? <Button isDisabled={pending} isPending={pending} size="lg" variant="primary" onPress={() => requestAction(booking, "check-in")}>{t("actions.checkIn")}</Button> : null}
                      {booking.status === "checked_in" ? <Button isDisabled={pending} isPending={pending} size="lg" variant="primary" onPress={() => requestAction(booking, "complete")}>{t("actions.complete")}</Button> : null}
                      {operational ? <Button isDisabled={pending} size="lg" variant="secondary" onPress={() => requestAction(booking, "no-show")}>{t("actions.noShow")}</Button> : null}
                      {["awaiting_payment", "confirmed"].includes(booking.status) && onReschedule ? <Button isDisabled={pending} size="lg" variant="secondary" onPress={() => { setOccurrence(""); setRescheduling(booking); }}>{t("actions.reschedule")}</Button> : null}
                      {cancellable ? <Button isDisabled={pending} size="lg" variant="danger" onPress={() => requestAction(booking, "cancel")}>{t("actions.cancel")}</Button> : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
            {hasMore ? <div className={styles.footer()}><Button isPending={loadingMore} variant="secondary" onPress={onLoadMore} size="lg">{t("loadMore")}</Button></div> : null}
          </section>
        )}
      </div>

      <AlertDialog>
        <AlertDialog.Backdrop isOpen={Boolean(confirming)} onOpenChange={(open) => { if (!open) setConfirming(null); }}>
          <AlertDialog.Container><AlertDialog.Dialog>
            <AlertDialog.Header><AlertDialog.Heading>{confirming ? t(`confirm.${confirming.action}.title`) : ""}</AlertDialog.Heading></AlertDialog.Header>
            <AlertDialog.Body><Typography type="body-sm">{confirming ? t(`confirm.${confirming.action}.body`, { name: confirming.booking.athleteName }) : ""}</Typography></AlertDialog.Body>
            <AlertDialog.Footer>
              <Button size="lg" variant="secondary" onPress={() => setConfirming(null)}>{t("dismiss")}</Button>
              <Button size="lg" variant={confirming?.action === "cancel" ? "danger" : "primary"} onPress={() => { if (confirming) void onAction?.(confirming.booking, confirming.action); setConfirming(null); }}>{t("confirmAction")}</Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog></AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      <AlertDialog>
        <AlertDialog.Backdrop isOpen={Boolean(rescheduling)} onOpenChange={(open) => { if (!open) setRescheduling(null); }}>
          <AlertDialog.Container><AlertDialog.Dialog>
            <AlertDialog.Header><AlertDialog.Heading>{t("rescheduleTitle")}</AlertDialog.Heading></AlertDialog.Header>
            <AlertDialog.Body><div className={styles.dialogBody()}><Typography type="body-sm">{t("rescheduleBody")}</Typography><select className={styles.select()} disabled={occurrencesLoading} value={occurrence} onChange={(event) => setOccurrence(event.target.value)}><option value="">{occurrencesLoading ? t("occurrencesLoading") : t("selectOccurrence")}</option>{occurrenceOptions.filter((item) => item.resourceType === rescheduling?.resourceType).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{!occurrencesLoading && occurrenceOptions.filter((item) => item.resourceType === rescheduling?.resourceType).length === 0 ? <Typography className={styles.meta()} type="body-sm">{t("noOccurrences")}</Typography> : null}</div></AlertDialog.Body>
            <AlertDialog.Footer><Button size="lg" variant="secondary" onPress={() => setRescheduling(null)}>{t("dismiss")}</Button><Button size="lg" isDisabled={!occurrence} variant="primary" onPress={() => { if (rescheduling && occurrence) void onReschedule?.(rescheduling, occurrence); setRescheduling(null); }}>{t("actions.reschedule")}</Button></AlertDialog.Footer>
          </AlertDialog.Dialog></AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </AppLayout>
  );
}
