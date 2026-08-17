"use client";

import { Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import type { OwnerTransactionKind } from "../../lib/owner-finance-data";
import { ownerFinanceTransactionsSectionVariants } from "./OwnerFinanceTransactionsSection.styles";
import type { OwnerFinanceTransactionsSectionProps } from "./OwnerFinanceTransactionsSection.types";

const KIND_LABEL_KEY: Record<
  OwnerTransactionKind,
  "kindMembership" | "kindBooking" | "kindRefund"
> = {
  membership: "kindMembership",
  booking: "kindBooking",
  refund: "kindRefund",
};

export function OwnerFinanceTransactionsSection({
  transactions,
  className,
}: OwnerFinanceTransactionsSectionProps) {
  const t = useTranslations("OwnerFinance");
  const styles = ownerFinanceTransactionsSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography
        className={styles.sectionTitle()}
        type="h4"
        weight="semibold"
      >
        {t("transactionsTitle")}
      </Typography>
      <div className={styles.groupCard()}>
        {transactions.map((transaction, index) => (
          <div key={transaction.id}>
            <div className={styles.row()}>
              <span className={styles.rowBody()}>
                <Typography
                  className={styles.rowLabel()}
                  type="body"
                  weight="medium"
                >
                  {transaction.title}
                </Typography>
                <Typography className={styles.rowHint()} type="body-sm">
                  {t(KIND_LABEL_KEY[transaction.kind])} ·{" "}
                  {transaction.dateLabel}
                </Typography>
              </span>
              <span
                className={
                  transaction.direction === "credit"
                    ? styles.rowValueCredit()
                    : styles.rowValueDebit()
                }
              >
                {transaction.direction === "credit" ? "+" : "−"}
                {transaction.amountLabel}
              </span>
            </div>
            {index < transactions.length - 1 ? (
              <div aria-hidden className={styles.divider()} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
