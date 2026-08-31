"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { OwnerCouponStatus } from "../../lib/owner-coupons-data";
import { ownerCouponsScreenVariants } from "./OwnerCouponsScreen.styles";
import type { OwnerCouponsScreenProps } from "./OwnerCouponsScreen.types";

const STATUS_COLOR: Record<
  OwnerCouponStatus,
  "success" | "warning" | "danger" | "default"
> = {
  draft: "default",
  active: "success",
  expired: "warning",
  disabled: "danger",
};

const STATUS_KEY = {
  draft: "statusDraft",
  active: "statusActive",
  expired: "statusExpired",
  disabled: "statusDisabled",
} as const;

export function OwnerCouponsScreen({
  coupons,
  form,
  pending = false,
  onFormChange,
  onCreate,
  onToggleStatus,
  pendingCouponId,
  className,
}: OwnerCouponsScreenProps) {
  const t = useTranslations("OwnerCoupons");
  const router = useRouter();
  const styles = ownerCouponsScreenVariants();

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
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

        <section className={styles.formCard()}>
          <Typography type="body" weight="semibold">
            {t("createTitle")}
          </Typography>
          <TextField>
            <Label>{t("codeLabel")}</Label>
            <Input
              onChange={(event) => onFormChange({ code: event.target.value })}
              placeholder={t("codePlaceholder")}
              value={form.code}
            />
          </TextField>
          <TextField>
            <Label>{t("percentLabel")}</Label>
            <Input
              inputMode="numeric"
              onChange={(event) =>
                onFormChange({ percentOff: event.target.value })
              }
              value={form.percentOff}
            />
          </TextField>
          <TextField>
            <Label>{t("maxRedemptionsLabel")}</Label>
            <Input
              inputMode="numeric"
              onChange={(event) =>
                onFormChange({ maxRedemptions: event.target.value })
              }
              value={form.maxRedemptions}
            />
          </TextField>
          <Button
            isDisabled={
              pending ||
              !onCreate ||
              !form.code.trim() ||
              !form.percentOff.trim() ||
              !form.maxRedemptions.trim()
            }
            isPending={pending}
            onPress={onCreate}
            size="lg"
            variant="primary"
          >
            {t("createSubmit")}
          </Button>
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("listTitle")}
          </Typography>
          {coupons.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            <div className={styles.card()}>
              {coupons.map((coupon, index) => (
                <div key={coupon.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {coupon.code}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {t("percentOff", { value: coupon.percentOff })} · {t("used", { count: coupon.usedCount, max: coupon.maxRedemptions })}
                      </Typography>
                      {coupon.expiresAtLabel ? (
                        <Typography className={styles.rowHint()} type="body-sm">
                          {t("expires")}: {coupon.expiresAtLabel}
                        </Typography>
                      ) : null}
                    </span>
                    <Chip color={STATUS_COLOR[coupon.status]} size="sm" variant="soft">
                      <Chip.Label>{t(STATUS_KEY[coupon.status])}</Chip.Label>
                    </Chip>
                  </div>
                  {onToggleStatus ? (
                    <div className="flex justify-end px-4 pb-3">
                      <Button
                        isDisabled={Boolean(pendingCouponId)}
                        isPending={pendingCouponId === coupon.id}
                        onPress={() => onToggleStatus(coupon)}
                        size="lg"
                        variant="secondary"
                      >
                        {coupon.apiStatus === "active"
                          ? t("disable")
                          : t("activate")}
                      </Button>
                    </div>
                  ) : null}
                  {index < coupons.length - 1 ? (
                    <div aria-hidden className={styles.divider()} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
