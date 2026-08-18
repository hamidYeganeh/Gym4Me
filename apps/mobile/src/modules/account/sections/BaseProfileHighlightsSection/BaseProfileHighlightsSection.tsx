import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { Fire1 } from "@repo/icons/Fire1";
import { AchievementTag } from "@repo/ui/cards/AchievementTag";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ACHIEVEMENT_TAG_COLORS,
  ACHIEVEMENT_TAG_VARIANTS,
} from "../AchievementsGridSection/AchievementsGridSection.types";
import { baseProfileHighlightsSectionVariants } from "./BaseProfileHighlightsSection.styles";
import type { BaseProfileHighlightsSectionProps } from "./BaseProfileHighlightsSection.types";

const INVITE_SRC = "/profile/invite-friends.png";
const PREVIEW_COUNT = 4;

export function BaseProfileHighlightsSection({
  inviteHref,
  streakHref,
  streakDays,
  achievementsHref,
  achievements,
  achievementsTotal,
  className,
}: BaseProfileHighlightsSectionProps) {
  const t = useTranslations("Mobile.Profile");
  const styles = baseProfileHighlightsSectionVariants();
  const router = useRouter();
  const preview = achievements.slice(0, PREVIEW_COUNT);

  return (
    <div className={styles.root({ className })}>
      {inviteHref ? (
        <article className={styles.invite()}>
          <div className={styles.inviteCopy()}>
            <Typography
              className={styles.inviteTitle()}
              type="body"
              weight="bold"
            >
              {t("inviteTitle")}
            </Typography>
            <Button
              className={styles.inviteCta()}
              onPress={() => router.push(inviteHref)}
              variant="ghost"
            >
              {t("inviteCta")}
              <ChevronRight size={16} />
            </Button>
          </div>
          <div aria-hidden className={styles.inviteMedia()}>
            <Image
              alt={t("inviteImageAlt")}
              className={styles.inviteImage()}
              fill
              sizes="40vw"
              src={INVITE_SRC}
            />
          </div>
        </article>
      ) : null}

      <section className={styles.block()}>
        <div className={styles.blockHeader()}>
          <Typography className={styles.blockTitle()} type="body" weight="bold">
            {t("streakTitle")}
          </Typography>
          <Button
            className={styles.blockLink()}
            onPress={() => router.push(streakHref)}
            variant="ghost"
          >
            {t("seeMore")}
          </Button>
        </div>
        <div className={styles.card()}>
          <div className={styles.streakBody()}>
            <Typography className={styles.streakHint()} type="body-sm">
              {t("streakHint")}
            </Typography>
            <span aria-hidden className={styles.streakIcon()}>
              <Fire1 size={48} />
            </span>
          </div>
          <div className={styles.streakFooter()}>
            <Typography className={styles.streakLabel()} type="body-sm">
              {t("totalStreak")}
            </Typography>
            <Typography
              className={styles.streakValue()}
              type="body"
              weight="bold"
            >
              {typeof streakDays === "number"
                ? t("streakDays", { count: streakDays })
                : t("streakEmptyValue")}
            </Typography>
          </div>
        </div>
      </section>

      <section className={styles.block()}>
        <div className={styles.blockHeader()}>
          <Typography className={styles.blockTitle()} type="body" weight="bold">
            {t("achievementsTitle")}
          </Typography>
          <Button
            className={styles.blockLink()}
            onPress={() => router.push(achievementsHref)}
            variant="ghost"
          >
            {t("seeAll")}
          </Button>
        </div>
        <div className={styles.card()}>
          {preview.length > 0 ? (
            <div className={styles.achievementsRow()}>
              {preview.map((item, index) => (
                <AchievementTag
                  color={
                    ACHIEVEMENT_TAG_COLORS[
                      index % ACHIEVEMENT_TAG_COLORS.length
                    ]
                  }
                  key={item.id}
                  size="md"
                  variant={
                    ACHIEVEMENT_TAG_VARIANTS[
                      index % ACHIEVEMENT_TAG_VARIANTS.length
                    ]
                  }
                />
              ))}
            </div>
          ) : (
            <Typography className={styles.achievementsEmpty()} type="body-sm">
              {t("achievementsEmpty")}
            </Typography>
          )}
          <div className={styles.achievementsFooter()}>
            <Typography className={styles.achievementsLabel()} type="body-sm">
              {t("achievementsTitle")}
            </Typography>
            <Typography
              className={styles.achievementsValue()}
              type="body"
              weight="bold"
            >
              {t("achievementsTotalValue", { count: achievementsTotal })}
            </Typography>
          </div>
        </div>
      </section>
    </div>
  );
}
