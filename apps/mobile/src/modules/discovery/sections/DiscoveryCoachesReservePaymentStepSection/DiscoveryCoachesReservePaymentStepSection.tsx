"use client";

import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import { Check } from "@repo/icons/Check";
import { useTranslations } from "next-intl";
import { formatJalaliDateShort } from "../../lib/club-calendar-data";
import { discoveryCoachesReservePaymentStepSectionVariants as styles } from "./DiscoveryCoachesReservePaymentStepSection.styles";
import type { DiscoveryCoachesReservePaymentStepSectionProps } from "./DiscoveryCoachesReservePaymentStepSection.types";

export function DiscoveryCoachesReservePaymentStepSection({
  coupon,
  onCouponChange,
  appliedCoupon,
  onApplyCoupon,
  selectedConsultation,
  selectedSlot,
  price,
  error,
}: DiscoveryCoachesReservePaymentStepSectionProps) {
  const t = useTranslations("CoachReserve");
  const slots = styles();

  return (
    <>
      <section className={slots.section()}>
        <Typography
          className={slots.sectionTitle()}
          type="h4"
          weight="semibold"
        >
          {t("paymentMethodTitle")}
        </Typography>
        <div className={slots.methodCard()}>
          <div className={slots.methodBody()}>
            <Typography
              className={slots.methodTitle()}
              type="body"
              weight="semibold"
            >
              {t("paymentGateway")}
            </Typography>
            <Typography className={slots.methodHint()} type="body-sm">
              {t("paymentGatewayHint")}
            </Typography>
          </div>
          <Check aria-hidden className={slots.methodCheck()} size={20} />
        </div>
      </section>

      <section className={slots.section()}>
        <div className={slots.couponRow()}>
          <TextField
            className={slots.couponField()}
            fullWidth
            name="coupon"
            onChange={onCouponChange}
            value={coupon}
          >
            <Label>{t("couponLabel")}</Label>
            <Input dir="ltr" placeholder={t("couponPlaceholder")} />
          </TextField>
          <Button
            className={slots.couponApply()}
            isDisabled={!coupon.trim()}
            onPress={onApplyCoupon}
            size="lg"
            variant="secondary"
          >
            {appliedCoupon === coupon.trim() && appliedCoupon
              ? t("couponApplied")
              : t("couponApply")}
          </Button>
        </div>
      </section>

      <section className={slots.section()}>
        <Typography
          className={slots.sectionTitle()}
          type="h4"
          weight="semibold"
        >
          {t("summaryTitle")}
        </Typography>
        <div className={slots.summaryCard()}>
          <div className={slots.summaryRow()}>
            <Typography className={slots.summaryLabel()} type="body-sm">
              {t("summaryConsultation")}
            </Typography>
            <Typography
              className={slots.summaryValue()}
              type="body"
              weight="medium"
            >
              {selectedConsultation
                ? t(
                    selectedConsultation.kind === "remote"
                      ? "consultationRemote"
                      : "consultationInPerson",
                  )
                : t("notSelected")}
            </Typography>
          </div>
          <div className={slots.summaryRow()}>
            <Typography className={slots.summaryLabel()} type="body-sm">
              {t("summarySlot")}
            </Typography>
            <Typography
              className={slots.summaryValue()}
              type="body"
              weight="medium"
            >
              {selectedSlot
                ? `${formatJalaliDateShort(selectedSlot.date)} — ${selectedSlot.timeLabel}`
                : t("notSelected")}
            </Typography>
          </div>
          {selectedSlot?.clubName &&
          selectedConsultation?.kind !== "remote" ? (
            <div className={slots.summaryRow()}>
              <Typography className={slots.summaryLabel()} type="body-sm">
                {t("summaryLocation")}
              </Typography>
              <Typography
                className={slots.summaryValue()}
                type="body"
                weight="medium"
              >
                {selectedSlot.clubName}
              </Typography>
            </div>
          ) : null}
          <div className={slots.summaryRow()}>
            <Typography className={slots.summaryLabel()} type="body-sm">
              {t("summaryPrice")}
            </Typography>
            <Typography
              className={slots.summaryValue()}
              type="body"
              weight="medium"
            >
              {price.toLocaleString("fa-IR")} {t("priceSuffix")}
            </Typography>
          </div>
          <div className={slots.summaryRow()}>
            <Typography className={slots.summaryLabel()} type="body-sm">
              {t("summaryDiscount")}
            </Typography>
            <Typography
              className={slots.summaryValue()}
              type="body"
              weight="medium"
            >
              {(0).toLocaleString("fa-IR")} {t("priceSuffix")}
            </Typography>
          </div>
          <div className={`${slots.summaryRow()} ${slots.summaryTotalRow()}`}>
            <Typography className={slots.summaryLabel()} type="body-sm">
              {t("summaryTotal")}
            </Typography>
            <Typography
              className={slots.summaryTotalValue()}
              type="h4"
              weight="bold"
            >
              {price.toLocaleString("fa-IR")} {t("priceSuffix")}
            </Typography>
          </div>
        </div>
      </section>

      {error ? (
        <Typography className={slots.errorText()} type="body-sm">
          {error}
        </Typography>
      ) : null}
    </>
  );
}
