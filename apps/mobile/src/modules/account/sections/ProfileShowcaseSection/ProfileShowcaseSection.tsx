"use client";

import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { Leaf } from "@repo/icons/Leaf";
import { Medal } from "@repo/icons/Medal";
import { QuestionMark } from "@repo/icons/QuestionMark";
import { SealCheck } from "@repo/icons/SealCheck";
import { StarFull } from "@repo/icons/StarFull";
import { Target1 } from "@repo/icons/Target1";
import { Trophy1 } from "@repo/icons/Trophy1";
import { UsersThree } from "@repo/icons/UsersThree";
import { ProfileStats } from "@repo/ui/layout/ProfileStats";
import type { ReactNode } from "react";
import type { ProfileAchievementKey } from "../../lib/profile-role-data";
import { profileShowcaseSectionVariants } from "./ProfileShowcaseSection.styles";
import type { ProfileShowcaseSectionProps } from "./ProfileShowcaseSection.types";

const ACHIEVEMENT_ICONS: Record<string, ReactNode> = {
  heart: <HeartEcg size={22} />,
  goal: <Target1 size={22} />,
  strength: <Trophy1 size={22} />,
  nutrition: <Leaf size={22} />,
  verified: <SealCheck size={22} />,
  mentor: <UsersThree size={22} />,
  transform: <Medal size={22} />,
  community: <UsersThree size={22} />,
  rating: <StarFull size={22} />,
  growth: <Trophy1 size={22} />,
};

function AchievementIcon({
  item,
  className,
}: {
  item: ProfileAchievementKey;
  className: string;
}) {
  if (!item.unlocked) {
    return (
      <span className={className}>
        <QuestionMark size={22} />
      </span>
    );
  }

  return (
    <span className={className}>
      {ACHIEVEMENT_ICONS[item.key] ?? <Medal size={22} />}
    </span>
  );
}

export function ProfileShowcaseSection({
  showcase,
  t,
  className,
  ...props
}: ProfileShowcaseSectionProps) {
  const styles = profileShowcaseSectionVariants();

  return (
    <section className={styles.root({ className })} {...props}>
      <ProfileStats
        stats={showcase.stats.map((stat) => ({
          key: stat.key,
          label: t(stat.labelKey),
          value: t(stat.valueKey),
        }))}
      />

      <div className={styles.block()}>
        <Typography className={styles.blockTitle()} type="h4" weight="bold">
          {t("tagsTitle")}
        </Typography>
        <div className={styles.tags()}>
          {showcase.tags.map((tagKey, index) => {
            const selected = index < 2;
            return (
              <Chip
                className={[
                  styles.tag(),
                  selected
                    ? "border-accent [--chip-fg:var(--accent)]"
                    : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={tagKey}
              >
                <Chip.Label>{t(tagKey)}</Chip.Label>
              </Chip>
            );
          })}
        </div>
      </div>

      <div className={styles.block()}>
        <Typography className={styles.blockTitle()} type="h4" weight="bold">
          {t("benefitsTitle")}
        </Typography>
        <ul className={styles.benefits()}>
          {showcase.benefits.map((benefitKey) => (
            <li className={styles.benefitRow()} key={benefitKey}>
              <span aria-hidden className={styles.benefitIcon()}>
                <Check size={16} />
              </span>
              <Typography className={styles.benefitLabel()} type="body">
                {t(benefitKey)}
              </Typography>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.block()}>
        <Typography className={styles.blockTitle()} type="h4" weight="bold">
          {t("achievementsTitle")}
        </Typography>
        <div className={styles.achievements()}>
          {showcase.achievements.map((item) => {
            const toneStyles = profileShowcaseSectionVariants({
              tone: item.unlocked ? item.tone : "muted",
            });
            return (
              <article className={styles.achievementCard()} key={item.key}>
                <AchievementIcon
                  className={toneStyles.achievementIcon()}
                  item={item}
                />
                <Typography
                  className={styles.achievementLabel()}
                  type="body-sm"
                  weight="semibold"
                >
                  {t(item.labelKey)}
                </Typography>
                <Typography className={styles.achievementStatus()} type="body-sm">
                  {item.unlocked
                    ? t("achievementUnlocked")
                    : t("achievementLocked")}
                </Typography>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
