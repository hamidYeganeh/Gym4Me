"use client";

import { Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { ownerFinanceSplitSectionVariants } from "./OwnerFinanceSplitSection.styles";
import type { OwnerFinanceSplitSectionProps } from "./OwnerFinanceSplitSection.types";

export function OwnerFinanceSplitSection({
  rows,
  className,
}: OwnerFinanceSplitSectionProps) {
  const t = useTranslations("OwnerFinance");
  const styles = ownerFinanceSplitSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div>
        <Typography
          className={styles.sectionTitle()}
          type="h4"
          weight="semibold"
        >
          {t("splitTitle")}
        </Typography>
        <Typography className={styles.sectionHint()} type="body-sm">
          {t("splitHint")}
        </Typography>
      </div>
      <div className={styles.groupCard()}>
        {rows.map((row) => (
          <div key={row.id}>
            {row.isTotal ? (
              <div aria-hidden className={styles.totalDivider()} />
            ) : null}
            <div className={styles.row()}>
              <span className={styles.rowBody()}>
                <Typography
                  className={
                    row.isTotal ? styles.totalRowLabel() : styles.rowLabel()
                  }
                  type="body"
                  weight={row.isTotal ? "bold" : "medium"}
                >
                  {row.label}
                </Typography>
              </span>
              <span
                className={
                  row.isTotal ? styles.rowValueBold() : styles.rowValue()
                }
              >
                {row.amountLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
