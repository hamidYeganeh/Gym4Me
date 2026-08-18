import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { achievementsSummarySectionVariants } from "./AchievementsSummarySection.styles";
import type { AchievementsSummarySectionProps } from "./AchievementsSummarySection.types";

export function AchievementsSummarySection({
  summary,
  className,
}: AchievementsSummarySectionProps) {
  const t = useTranslations("Mobile.Achievements");
  const styles = achievementsSummarySectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.balance()}>
        <span className={styles.balanceValue()}>
          {(summary?.points.balance ?? 0).toLocaleString("fa-IR")}
        </span>
        <Typography className={styles.balanceLabel()} type="body-sm">
          {t("balance")}
        </Typography>
      </div>
      <div className={styles.stats()}>
        <div className={styles.stat()}>
          <span className={styles.statValue()}>
            {(summary?.points.lifetime ?? 0).toLocaleString("fa-IR")}
          </span>
          <span className={styles.statLabel()}>{t("lifetime")}</span>
        </div>
        <div className={styles.stat()}>
          <span className={styles.statValue()}>
            {(summary?.achievements.unlocked ?? 0).toLocaleString("fa-IR")}
            {" / "}
            {(summary?.achievements.total ?? 0).toLocaleString("fa-IR")}
          </span>
          <span className={styles.statLabel()}>{t("unlockedCount")}</span>
        </div>
      </div>
    </section>
  );
}
