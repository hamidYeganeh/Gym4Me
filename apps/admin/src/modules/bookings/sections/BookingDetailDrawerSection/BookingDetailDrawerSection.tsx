import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type { Booking } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components";
import { formatAdminDate } from "@/shared/lib/user-format";

type Props = {
  booking: Booking | null;
  onOpenChange: (open: boolean) => void;
};

const amount = (value: number) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

export function BookingDetailDrawerSection({ booking, onOpenChange }: Props) {
  const t = useTranslations("Admin.Bookings");
  const athleteName = booking
    ? [booking.athlete?.name.first, booking.athlete?.name.last]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <AdminFormDrawer
      isOpen={Boolean(booking)}
      title={t("details.title")}
      onOpenChange={onOpenChange}
    >
      {booking ? (
        <div className="flex flex-col gap-4 pb-10" dir="rtl">
          <section className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Typography color="muted" type="body-sm">{t("details.code")}</Typography>
                <Typography className="mt-1 tabular-nums" dir="ltr" weight="semibold">{booking.code}</Typography>
              </div>
              <Chip size="sm" variant="soft"><Chip.Label>{t(`status.${booking.status}`)}</Chip.Label></Chip>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
            <Detail label={t("details.athlete")} value={athleteName || t("details.unknownAthlete")} />
            <Detail label={t("details.phone")} value={booking.athlete?.phone ?? "—"} dir="ltr" />
            <Detail label={t("details.club")} value={booking.club?.name ?? "—"} />
            <Detail label={t("details.resource")} value={booking.resource.title ?? t(`resourceType.${booking.resource.type}`)} />
            <Detail label={t("details.startsAt")} value={formatAdminDate(booking.startsAt)} />
            <Detail label={t("details.endsAt")} value={formatAdminDate(booking.endsAt)} />
            <Detail label={t("details.source")} value={t(`details.sourceValue.${booking.source ?? "athlete"}`)} />
            <Detail label={t("details.holder")} value={t(`details.holderValue.${booking.holderType ?? "member"}`)} />
            <Detail label={t("details.attendees")} value={booking.attendeeCount.toLocaleString("fa-IR")} />
            <Detail label={t("details.createdAt")} value={formatAdminDate(booking.createdAt)} />
          </section>

          <section className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
            <Detail label={t("details.amount")} value={amount(booking.pricing.amount)} />
            <Detail label={t("details.discount")} value={amount(booking.pricing.discount)} />
            <Detail label={t("details.total")} value={amount(booking.pricing.total)} />
            <Detail label={t("details.payment")} value={booking.payment?.paidAt ? t("details.paid") : t("details.unpaid")} />
            <Detail label={t("details.paymentRef")} value={booking.payment?.refId ?? "—"} dir="ltr" />
            <Detail label={t("details.coupon")} value={booking.pricing.couponCode ?? "—"} dir="ltr" />
          </section>

          {booking.intake.note ? (
            <section className="rounded-2xl border border-border bg-surface p-4">
              <Typography color="muted" type="body-sm">{t("details.note")}</Typography>
              <Typography className="mt-2 whitespace-pre-wrap">{booking.intake.note}</Typography>
            </section>
          ) : null}

          {booking.cancellation ? (
            <section className="rounded-2xl border border-danger/30 bg-danger/5 p-4">
              <Typography weight="semibold">{t("details.cancellation")}</Typography>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Detail label={t("details.cancelledAt")} value={formatAdminDate(booking.cancellation.cancelledAt)} />
                <Detail label={t("details.cancelledBy")} value={t(`details.actor.${booking.cancellation.cancelledBy}`)} />
                <Detail label={t("details.refundAmount")} value={amount(booking.cancellation.refundAmount)} />
                <Detail label={t("details.feeAmount")} value={amount(booking.cancellation.feeAmount)} />
              </div>
              {booking.cancellation.note ? <Typography className="mt-3 whitespace-pre-wrap" type="body-sm">{booking.cancellation.note}</Typography> : null}
            </section>
          ) : null}
        </div>
      ) : null}
    </AdminFormDrawer>
  );
}

function Detail({ label, value, dir }: { label: string; value: string; dir?: "ltr" | "rtl" }) {
  return (
    <div className="min-w-0">
      <Typography color="muted" type="body-sm">{label}</Typography>
      <Typography className="mt-1 break-words" dir={dir}>{value}</Typography>
    </div>
  );
}
