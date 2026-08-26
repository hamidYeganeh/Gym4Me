"use client";

import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { OwnerFamilyPlanStatus } from "../../lib/owner-family-memberships-data";
import { ownerFamilyMembershipsScreenVariants } from "./OwnerFamilyMembershipsScreen.styles";
import type { OwnerFamilyMembershipsScreenProps } from "./OwnerFamilyMembershipsScreen.types";

const STATUS_COLOR: Record<OwnerFamilyPlanStatus, "success" | "danger"> = {
  active: "success",
  suspended: "danger",
};

const STATUS_KEY = {
  active: "statusActive",
  suspended: "statusSuspended",
} as const;

export function OwnerFamilyMembershipsScreen({
  plans,
  className,
}: OwnerFamilyMembershipsScreenProps) {
  const t = useTranslations("OwnerFamilyMemberships");
  const router = useRouter();
  const styles = ownerFamilyMembershipsScreenVariants();

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

        <section className={styles.section()}>
          {plans.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            plans.map((plan) => {
              const filledCount = plan.slots.filter(
                (slot) => slot.status === "filled",
              ).length;

              return (
                <div key={plan.id} className={styles.card()}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {plan.orgLabel}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {plan.planName}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {t("slots", { filled: filledCount, total: plan.slotsTotal })} · {t("expires")}: {plan.expiresAtLabel}
                      </Typography>
                    </span>
                    <Chip color={STATUS_COLOR[plan.status]} size="sm" variant="soft">
                      <Chip.Label>{t(STATUS_KEY[plan.status])}</Chip.Label>
                    </Chip>
                  </div>
                  <span className={styles.slots()}>
                    {plan.slots.map((slot) => (
                      <Chip
                        key={slot.id}
                        color={slot.status === "filled" ? "accent" : "default"}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>
                          {slot.status === "filled"
                            ? (slot.name ?? t("unnamedSlot"))
                            : t("emptySlot")}
                        </Chip.Label>
                      </Chip>
                    ))}
                  </span>
                </div>
              );
            })
          )}
        </section>
      </div>
    </AppLayout>
  );
}
