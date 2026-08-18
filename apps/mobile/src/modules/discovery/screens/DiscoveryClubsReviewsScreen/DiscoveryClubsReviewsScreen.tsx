"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
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
    <AppLayout
      className={styles.root}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
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
