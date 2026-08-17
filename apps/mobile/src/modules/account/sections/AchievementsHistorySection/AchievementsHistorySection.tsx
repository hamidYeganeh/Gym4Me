import { Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { achievementsHistorySectionVariants } from "./AchievementsHistorySection.styles";
import type { AchievementsHistorySectionProps } from "./AchievementsHistorySection.types";

export function AchievementsHistorySection({
  transactions,
  className,
}: AchievementsHistorySectionProps) {
  const t = useTranslations("Mobile.Achievements");
  const styles = achievementsHistorySectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="body-sm">
        {t("historySection")}
      </Typography>
      {transactions.length === 0 ? (
        <p className={styles.empty()}>{t("historyEmpty")}</p>
      ) : (
        <div className={styles.card()}>
          {transactions.map((tx, index) => (
            <div key={tx.id}>
              <div className={styles.row()}>
                <span className={styles.body()}>
                  <span className={styles.label()}>
                    {tx.note ?? t(`reasons.${tx.reason}`)}
                  </span>
                  <span className={styles.date()} dir="ltr">
                    {new Date(tx.occurredAt).toLocaleDateString("fa-IR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </span>
                <span
                  className={
                    tx.amount >= 0
                      ? styles.amountPositive()
                      : styles.amountNegative()
                  }
                >
                  {tx.amount > 0
                    ? `${tx.amount.toLocaleString("fa-IR")}+`
                    : tx.amount.toLocaleString("fa-IR")}
                </span>
              </div>
              {index < transactions.length - 1 ? (
                <div aria-hidden className={styles.divider()} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
