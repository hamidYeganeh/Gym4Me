import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { BOOKING_CANCEL_REASON_KEYS } from "@/modules/athlete/lib/api-bookings";
import { athleteBookingDetailActionsSectionVariants } from "./AthleteBookingDetailActionsSection.styles";
import type { AthleteBookingDetailActionsSectionProps } from "./AthleteBookingDetailActionsSection.types";

export function AthleteBookingDetailActionsSection({
  t,
  booking,
  router,
  isApiBooking,
  isCancelConfirmOpen,
  setIsCancelConfirmOpen,
  isCancelRequested,
  cancelReasonKey,
  setCancelReasonKey,
  cancelNote,
  setCancelNote,
  isActing,
  actionError,
  cancellationPreview,
  showPayAction,
  showCancelAction,
  showRescheduleAction,
  onPay,
  onConfirmCancel,
  openCancelPreview,
}: AthleteBookingDetailActionsSectionProps) {
  const styles = athleteBookingDetailActionsSectionVariants();

  if (!booking) return null;

  return (
    <div className={styles.actions()}>
      {actionError ? (
        <Typography className={styles.errorText()} type="body-sm">
          {actionError}
        </Typography>
      ) : null}

      {showPayAction ? (
        <Button
          fullWidth
          isPending={isActing}
          onPress={onPay}
          size="lg"
          variant="primary"
        >
          {t("payNow")}
        </Button>
      ) : null}

      {showRescheduleAction ? (
        <Button
          fullWidth
          onPress={() =>
            router.push(`/athlete/booking/reschedule?bookingId=${encodeURIComponent(booking.id)}`)
          }
          size="lg"
          variant="secondary"
        >
          {t("rescheduleBooking")}
        </Button>
      ) : null}

      {isCancelRequested ? (
        <div className={styles.cancelledNotice()}>
          <Typography className={styles.cancelledNoticeText()} type="body-sm">
            {t("cancelRequested")}
          </Typography>
        </div>
      ) : null}

      {showCancelAction && !isCancelConfirmOpen ? (
        <Button
          className="text-danger"
          fullWidth
          isPending={isActing}
          onPress={openCancelPreview}
          size="lg"
          variant="ghost"
        >
          {t("cancelBooking")}
        </Button>
      ) : null}

      {showCancelAction && isCancelConfirmOpen ? (
        <div className={styles.cancelConfirm()}>
          <Typography
            className={styles.cancelConfirmTitle()}
            type="body"
            weight="semibold"
          >
            {t("cancelConfirmTitle")}
          </Typography>
          <Typography className={styles.cancelConfirmBody()} type="body-sm">
            {cancellationPreview
              ? t("cancelRefundPreview", {
                  refund: cancellationPreview.refundAmount.toLocaleString(
                    "fa-IR",
                  ),
                  fee: cancellationPreview.feeAmount.toLocaleString("fa-IR"),
                })
              : t("cancelConfirmBody")}
          </Typography>

          {isApiBooking ? (
            <>
              <div
                aria-label={t("cancelReasonTitle")}
                className={styles.cancelReasons()}
                role="radiogroup"
              >
                {BOOKING_CANCEL_REASON_KEYS.map((reasonKey) => {
                  const isSelected = cancelReasonKey === reasonKey;
                  return (
                    <Button size="lg"
                      aria-checked={isSelected}
                      className={`${styles.cancelReason()} ${ isSelected ? styles.cancelReasonSelected() : "" }`}
                      key={reasonKey}
                      variant="ghost"
                      onPress={() => setCancelReasonKey(reasonKey)}
                    >
                      <span
                        aria-hidden
                        className={`${styles.cancelReasonRadio()} ${
                          isSelected ? styles.cancelReasonRadioSelected() : ""
                        }`}
                      >
                        {isSelected ? (
                          <span className={styles.cancelReasonDot()} />
                        ) : null}
                      </span>
                      <Typography
                        className={styles.cancelReasonLabel()}
                        type="body-sm"
                      >
                        {t(`cancelReasons.${reasonKey}`)}
                      </Typography>
                    </Button>
                  );
                })}
              </div>

              {cancelReasonKey === "other" ? (
                <TextField
                  fullWidth
                  name="cancelNote"
                  onChange={(value) => setCancelNote(value.slice(0, 300))}
                  value={cancelNote}
                >
                  <Label>{t("cancelNoteLabel")}</Label>
                  <Input placeholder={t("cancelNotePlaceholder")} />
                </TextField>
              ) : null}
            </>
          ) : null}

          <div className={styles.cancelConfirmActions()}>
            <Button
              fullWidth
              isDisabled={isApiBooking && !cancelReasonKey}
              isPending={isActing}
              onPress={onConfirmCancel}
              variant="danger"
             size="lg">
              {t("confirmCancel")}
            </Button>
            <Button size="lg"
              fullWidth
              onPress={() => setIsCancelConfirmOpen(false)}
              variant="ghost"
            >
              {t("keepBooking")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
