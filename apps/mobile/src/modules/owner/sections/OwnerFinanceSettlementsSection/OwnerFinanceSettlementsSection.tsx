"use client";

import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import type { OwnerSettlementState } from "../../lib/owner-finance-data";
import { ownerFinanceSettlementsSectionVariants } from "./OwnerFinanceSettlementsSection.styles";
import type { OwnerFinanceSettlementsSectionProps } from "./OwnerFinanceSettlementsSection.types";

const SETTLEMENT_CHIP_COLOR: Record<
  OwnerSettlementState,
  "success" | "warning" | "accent"
> = {
  paid: "success",
  processing: "warning",
  upcoming: "accent",
};

const SETTLEMENT_LABEL_KEY = {
  paid: "statePaid",
  processing: "stateProcessing",
  upcoming: "stateUpcoming",
} as const;

export function OwnerFinanceSettlementsSection({
  settlements,
  className,
}: OwnerFinanceSettlementsSectionProps) {
  const t = useTranslations("OwnerFinance");
  const styles = ownerFinanceSettlementsSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography
        className={styles.sectionTitle()}
        type="h4"
        weight="semibold"
      >
        {t("settlementsTitle")}
      </Typography>
      <div className={styles.groupCard()}>
        {settlements.map((settlement, index) => (
          <div key={settlement.id}>
            <div className={styles.row()}>
              <span className={styles.rowBody()}>
                <Typography
                  className={styles.rowLabel()}
                  type="body"
                  weight="medium"
                >
                  {settlement.periodLabel}
                </Typography>
                <Typography className={styles.rowHint()} type="body-sm">
                  {settlement.amountLabel}
                </Typography>
              </span>
              <Chip
                color={SETTLEMENT_CHIP_COLOR[settlement.state]}
                size="sm"
                variant="soft"
              >
                <Chip.Label>
                  {t(SETTLEMENT_LABEL_KEY[settlement.state])}
                </Chip.Label>
              </Chip>
            </div>
            {index < settlements.length - 1 ? (
              <div aria-hidden className={styles.divider()} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
