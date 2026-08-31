import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { CloseX } from "@repo/icons/CloseX";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ACTION_LABEL_KEY,
  STATUS_CHIP_COLOR,
  STATUS_LABEL_KEY,
} from "./CoachBookingsListSection.types";
import { coachBookingsListSectionVariants } from "./CoachBookingsListSection.styles";
import type { CoachBookingsListSectionProps } from "./CoachBookingsListSection.types";

export function CoachBookingsListSection({
  tab,
  items,
  pendingId,
  hasApiActions,
  onAction,
  onAcceptMock,
  onRejectMock,
  className,
}: CoachBookingsListSectionProps) {
  const t = useTranslations("CoachBookings");
  const styles = coachBookingsListSectionVariants();

  if (items.length === 0) {
    return (
      <div className={styles.empty({ className })}>
        <Typography className={styles.emptyTitle()} type="h4" weight="semibold">
          {t(`empty_${tab}_title`)}
        </Typography>
        <Typography className={styles.emptyBody()} type="body-sm">
          {t(`empty_${tab}_body`)}
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.list({ className })}>
      {items.map((booking) => (
        <article className={styles.card()} key={booking.id}>
          <div className={styles.cardHeader()}>
            <Image
              alt={booking.clientName}
              className={styles.avatar()}
              height={48}
              src={booking.avatar}
              width={48}
            />
            <div className={styles.cardHeaderBody()}>
              <Typography
                className={styles.clientName()}
                type="body"
                weight="semibold"
              >
                {booking.clientName}
              </Typography>
              <Typography className={styles.typeLabel()} type="body-sm">
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

          <div className={styles.metaRow()}>
            <Typography className={styles.metaItem()} type="body-sm">
              {booking.dateLabel}
            </Typography>
            <Typography className={styles.metaItem()} type="body-sm">
              {booking.timeLabel}
            </Typography>
            <Typography
              className={styles.price()}
              type="body-sm"
              weight="semibold"
            >
              {booking.priceLabel}
            </Typography>
          </div>

          {booking.status === "CONFIRMED" && booking.checkInCode ? (
            <Typography className={styles.checkInHint()} type="body-sm">
              {t("checkInHint", { code: booking.checkInCode })}
            </Typography>
          ) : null}

          {booking.api && hasApiActions && onAction && booking.api.actions.length > 0 ? (
            <div className={styles.actions()}>
              {booking.api.actions.map((action) => (
                <Button size="lg"
                  className={
                    action === "cancel" || action === "noShow"
                      ? styles.rejectButton()
                      : styles.acceptButton()
                  }
                  isPending={pendingId === booking.id}
                  key={action}
                  onPress={() => void onAction(booking.id, action)}
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
            <div className={styles.actions()}>
              <Button size="lg"
                className={styles.acceptButton()}
                onPress={() => onAcceptMock(booking.id)}
                variant="primary"
              >
                <Check size={18} />
                {t("accept")}
              </Button>
              <Button size="lg"
                className={styles.rejectButton()}
                onPress={() => onRejectMock(booking.id)}
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
  );
}
