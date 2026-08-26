"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { OwnerDebtStatus } from "../../lib/owner-debts-data";
import { ownerDebtsScreenVariants } from "./OwnerDebtsScreen.styles";
import type { OwnerDebtsScreenProps } from "./OwnerDebtsScreen.types";

const STATUS_COLOR: Record<
  OwnerDebtStatus,
  "success" | "warning" | "danger" | "accent" | "default"
> = {
  open: "accent",
  partial: "warning",
  settled: "success",
  overdue: "danger",
  "written-off": "default",
};

const STATUS_KEY = {
  open: "statusOpen",
  partial: "statusPartial",
  settled: "statusSettled",
  overdue: "statusOverdue",
  "written-off": "statusWrittenOff",
} as const;

export function OwnerDebtsScreen({
  debts,
  pendingId,
  onRecordPayment,
  className,
}: OwnerDebtsScreenProps) {
  const t = useTranslations("OwnerDebts");
  const router = useRouter();
  const styles = ownerDebtsScreenVariants();

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
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("listTitle")}
          </Typography>
          {debts.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            <div className={styles.card()}>
              {debts.map((debt, index) => (
                <div key={debt.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {debt.memberName}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {t("dueAt")}: {debt.dueAtLabel} · {t("installments", { count: debt.installmentCount })}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {t("remaining")}: {debt.remainingLabel}
                      </Typography>
                    </span>
                    <span className={styles.rowActions()}>
                      <Chip color={STATUS_COLOR[debt.status]} size="sm" variant="soft">
                        <Chip.Label>{t(STATUS_KEY[debt.status])}</Chip.Label>
                      </Chip>
                      {debt.status !== "settled" && onRecordPayment ? (
                        <Button
                          isDisabled={pendingId === debt.id}
                          isPending={pendingId === debt.id}
                          onPress={() => onRecordPayment(debt)}
                          size="sm"
                          variant="secondary"
                        >
                          {t("recordPayment")}
                        </Button>
                      ) : null}
                    </span>
                  </div>
                  {index < debts.length - 1 ? (
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
