"use client";

import { Typography } from "@heroui/react/typography";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { discoveryClubsReviewsScreenStyles as styles } from "./DiscoveryClubsReviewsScreen.styles";
import type { DiscoveryClubsReviewsScreenProps } from "./DiscoveryClubsReviewsScreen.types";

export function DiscoveryClubsReviewsScreen({
  club,
}: DiscoveryClubsReviewsScreenProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("reviewsPageTitle")}
        />
      }
    >
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
    </AppLayout>
  );
}
