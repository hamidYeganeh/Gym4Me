"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { discoveryClubsReviewsScreenStyles as styles } from "./DiscoveryClubsReviewsScreen.styles";
import type { DiscoveryClubsReviewsScreenProps } from "./DiscoveryClubsReviewsScreen.types";

export function DiscoveryClubsReviewsScreen({
  club,
}: DiscoveryClubsReviewsScreenProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Button
          aria-label={t("back")}
          isIconOnly
          onPress={() => router.back()}
          size="lg"
          variant="secondary"
        >
          <ChevronLeft size={20} />
        </Button>
        <Typography className={styles.title} type="h4" weight="semibold">
          {t("reviewsPageTitle")}
        </Typography>
      </header>

      {club.reviews.length === 0 ? (
        <Typography className={styles.empty} type="body-sm">
          {t("notFound")}
        </Typography>
      ) : (
        <div className={styles.list}>
          {club.reviews.map((review) => (
            <ReviewCard
              avatar={review.avatar}
              avatarAlt={review.title}
              avatarFallback={review.avatarFallback}
              className={styles.reviewCard}
              content={review.content}
              date={review.date}
              dislikeLabel={t("reviewDislike")}
              isVerified={review.isVerified}
              key={review.id}
              likeLabel={t("reviewLike")}
              rating={review.rating}
              reportLabel={t("reviewReport")}
              title={review.title}
              verifiedLabel={t("reviewVerified")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
