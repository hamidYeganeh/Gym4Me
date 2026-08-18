import { Typography } from "@heroui/react/typography";
import type { MyAchievement } from "@repo/api";
import { AchievementTag } from "@repo/ui/cards/AchievementTag";
import { useTranslations } from "next-intl";
import {
  ACHIEVEMENT_TAG_COLORS,
  ACHIEVEMENT_TAG_VARIANTS,
} from "./AchievementsGridSection.types";
import { achievementsGridSectionVariants } from "./AchievementsGridSection.styles";
import type { AchievementsGridSectionProps } from "./AchievementsGridSection.types";

export function AchievementsGridSection({
  achievements,
  className,
}: AchievementsGridSectionProps) {
  const t = useTranslations("Mobile.Achievements");
  const styles = achievementsGridSectionVariants();

  const unlocked = achievements.filter((item) => item.state === "unlocked");
  const locked = achievements.filter((item) => item.state === "locked");

  const renderAchievement = (item: MyAchievement, index: number) => {
    const isUnlocked = item.state === "unlocked";
    return (
      <div
        key={item.id}
        className={styles.gridItem({
          className: isUnlocked ? undefined : styles.gridItemLocked(),
        })}
      >
        <AchievementTag
          color={
            isUnlocked
              ? ACHIEVEMENT_TAG_COLORS[index % ACHIEVEMENT_TAG_COLORS.length]
              : "accent"
          }
          size="md"
          variant={ACHIEVEMENT_TAG_VARIANTS[index % ACHIEVEMENT_TAG_VARIANTS.length]}
        />
        <Typography className={styles.gridItemTitle()} type="body-sm">
          {item.title}
        </Typography>
        {isUnlocked ? (
          item.bonusPoints > 0 ? (
            <span className={styles.gridItemMeta()}>
              {t("bonusPoints", { points: item.bonusPoints })}
            </span>
          ) : null
        ) : item.progress ? (
          <span className={styles.gridItemMeta()}>
            {t("progress", {
              current: Math.min(item.progress.current, item.progress.threshold),
              threshold: item.progress.threshold,
            })}
          </span>
        ) : (
          <span className={styles.gridItemMeta()}>{t("locked")}</span>
        )}
      </div>
    );
  };

  if (achievements.length === 0) {
    return (
      <Typography className="py-16 text-center text-muted" type="body-sm">
        {t("empty")}
      </Typography>
    );
  }

  return (
    <div className={className}>
      {unlocked.length > 0 ? (
        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="body-sm">
            {t("unlockedSection")}
          </Typography>
          <div className={styles.grid()}>
            {unlocked.map(renderAchievement)}
          </div>
        </section>
      ) : null}

      {locked.length > 0 ? (
        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="body-sm">
            {t("lockedSection")}
          </Typography>
          <div className={styles.grid()}>
            {locked.map((item, index) =>
              renderAchievement(item, unlocked.length + index),
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
