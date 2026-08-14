"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { OwnerDebtStatus } from "../../lib/owner-debts-data";
import { ownerDebtsScreenVariants } from "./OwnerDebtsScreen.styles";
import type { OwnerDebtsScreenProps } from "./OwnerDebtsScreen.types";

const STATUS_COLOR: Record<
  OwnerDebtStatus,
  "success" | "warning" | "danger" | "accent"
> = {
  open: "accent",
  partial: "warning",
  settled: "success",
  overdue: "danger",
};

const STATUS_KEY = {
  open: "statusOpen",
  partial: "statusPartial",
  settled: "statusSettled",
  overdue: "statusOverdue",
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
