"use client";

import { Button, Typography } from "@heroui/react";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Kebab } from "@repo/icons/Kebab";
import { SealCheck } from "@repo/icons/SealCheck";
import { StarFull } from "@repo/icons/StarFull";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { discoveryCoachesDetailHeroSectionStyles as styles } from "./DiscoveryCoachesDetailHeroSection.styles";
import type { DiscoveryCoachesDetailHeroSectionProps } from "./DiscoveryCoachesDetailHeroSection.types";

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

export function DiscoveryCoachesDetailHeroSection({
  coach,
}: DiscoveryCoachesDetailHeroSectionProps) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const showRating =
    typeof coach.rating === "number" && Number.isFinite(coach.rating);

  return (
    <section aria-label={coach.name} className={styles.root}>
      <header className={styles.header}>
        <Button
          aria-label={t("back")}
          isIconOnly
          onPress={() => router.back()}
          size="lg"
          variant="ghost"
        >
          <ChevronLeft className="text-foreground" size={22} />
        </Button>
        <Typography
          className={styles.headerTitle}
          type="body"
          weight="semibold"
        >
          {t("pageTitle")}
        </Typography>
        <Button
          aria-label={t("more")}
          isIconOnly
          size="lg"
          variant="ghost"
          onPress={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              void navigator.share({ title: coach.name, url: window.location.href });
            }
          }}
        >
          <Kebab className="text-foreground" size={22} />
        </Button>
      </header>

      <div className={styles.identityCard}>
        {coach.isVerified ? (
          <div className={styles.verifiedRow}>
            <SealCheck aria-hidden size={18} />
            <Typography className={styles.verifiedText} type="body-sm">
              {t("certifiedTrainer")}
            </Typography>
          </div>
        ) : null}

        <Typography className={styles.name} type="h2" weight="bold">
          {coach.name}
        </Typography>
        <Typography className={styles.specialty} type="body">
          {coach.specialty}
        </Typography>

        <div className={styles.metaRow}>
          {showRating ? (
            <span className={styles.metaItem}>
              <StarFull aria-hidden className={styles.ratingStar} size={16} />
              <Typography className={styles.metaValue} type="body-sm" weight="semibold">
                {formatRating(coach.rating)}{" "}
                <span className="text-muted">
                  {t("reviewsCount", { count: coach.ratingCount })}
                </span>
              </Typography>
            </span>
          ) : null}

          {showRating && coach.yearsExperience > 0 ? (
            <span aria-hidden className={styles.metaDot} />
          ) : null}

          {coach.yearsExperience > 0 ? (
            <span className={styles.metaItem}>
              <BarbellHorizontal aria-hidden className="text-muted" size={16} />
              <Typography className={styles.metaValue} type="body-sm">
                {t("yearsExperience", { count: coach.yearsExperience })}
              </Typography>
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
