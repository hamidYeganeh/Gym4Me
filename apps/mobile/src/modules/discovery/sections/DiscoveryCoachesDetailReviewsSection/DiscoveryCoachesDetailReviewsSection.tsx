"use client";

import { useMemo, useState } from "react";
import { SearchField } from "@heroui/react/search-field";
import { Typography } from "@heroui/react/typography";
import { Clock } from "@repo/icons/Clock";
import { Handshake } from "@repo/icons/Handshake";
import { ThumbsUp } from "@repo/icons/ThumbsUp";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { ReviewSummaryCard } from "@repo/ui/cards/ReviewSummaryCard";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import {
  buildCoachReviewSummary,
  COACH_REVIEW_FILTERS,
  type CoachReviewFilterId,
} from "../../lib/coach-review-summary";
import { discoveryCoachesDetailReviewsSectionVariants } from "./DiscoveryCoachesDetailReviewsSection.styles";
import type { DiscoveryCoachesDetailReviewsSectionProps } from "./DiscoveryCoachesDetailReviewsSection.types";

const HIGHLIGHT_ICON_SIZE = 24;

const FILTER_LABEL_KEY = {
  all: "reviewFilterAll",
  skill: "reviewFilterSkill",
  conversation: "reviewFilterConversation",
  attitude: "reviewFilterAttitude",
  rude: "reviewFilterRude",
} as const satisfies Record<CoachReviewFilterId, string>;

function formatAverage(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatCount(value: number) {
  return value.toLocaleString("fa-IR");
}

export function DiscoveryCoachesDetailReviewsSection({
  coach,
  className,
  ...props
}: DiscoveryCoachesDetailReviewsSectionProps) {
  const t = useTranslations("CoachDetail");
  const styles = discoveryCoachesDetailReviewsSectionVariants();
  const [filter, setFilter] = useState<CoachReviewFilterId>("all");
  const [query, setQuery] = useState("");

  const summary = useMemo(
    () =>
      buildCoachReviewSummary(
        coach.reviews,
        coach.rating,
        coach.ratingCount,
      ),
    [coach.rating, coach.ratingCount, coach.reviews],
  );

  const filteredReviews = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return coach.reviews.filter((review) => {
      if (filter === "rude" && review.rating >= 3.5) return false;
      if (
        (filter === "skill" ||
          filter === "conversation" ||
          filter === "attitude") &&
        review.rating < 4
      ) {
        return false;
      }
      if (!normalized) return true;
      return (
        review.title.toLowerCase().includes(normalized) ||
        review.content.toLowerCase().includes(normalized)
      );
    });
  }, [coach.reviews, filter, query]);

  return (
    <section className={styles.root({ className })} {...props}>
      <ReviewSummaryCard
        average={formatAverage(summary.average)}
        averageLabel={t("avgRatingLabel")}
        buckets={summary.buckets}
        highlights={[
          {
            id: "recommended",
            icon: <ThumbsUp size={HIGHLIGHT_ICON_SIZE} />,
            title: t("reviewHighlightRecommendedTitle"),
            description: t("reviewHighlightRecommendedDescription"),
          },
          {
            id: "wait-time",
            icon: <Clock size={HIGHLIGHT_ICON_SIZE} />,
            title: t("reviewHighlightWaitTimeTitle"),
            description: t("reviewHighlightWaitTimeDescription"),
          },
          {
            id: "manner",
            icon: <Handshake size={HIGHLIGHT_ICON_SIZE} />,
            title: t("reviewHighlightMannerTitle"),
            description: t("reviewHighlightMannerDescription"),
          },
        ]}
        usersLabel={t("reviewUsers", {
          count: formatCount(summary.total || coach.ratingCount),
        })}
      />

      <div className={styles.filtersBlock()}>
        <Typography className={styles.filtersTitle()} type="h4" weight="bold">
          {t("allReviews")}
        </Typography>
        <div className={styles.filters()}>
          {COACH_REVIEW_FILTERS.map((id) => (
            <FilterChip
              key={id}
              onPress={() => setFilter(id)}
              selected={filter === id}
            >
              {t(FILTER_LABEL_KEY[id])}
            </FilterChip>
          ))}
        </div>
      </div>

      <SearchField
        aria-label={t("searchReviews")}
        className={styles.search()}
        value={query}
        variant="secondary"
        onChange={setQuery}
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t("searchReviews")} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div className={styles.list()}>
        {filteredReviews.map((review) => (
          <ReviewCard
            avatar={review.avatar}
            avatarAlt={review.title}
            avatarFallback={review.avatarFallback}
            className={styles.reviewCard()}
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
    </section>
  );
}
