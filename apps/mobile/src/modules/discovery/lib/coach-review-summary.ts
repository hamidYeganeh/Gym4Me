import type { CoachDetailReview } from "./coach-detail-data";

export type CoachRatingBucket = {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
  ratio: number;
};

export type CoachReviewSummary = {
  average: number;
  total: number;
  buckets: CoachRatingBucket[];
};

export function buildCoachReviewSummary(
  reviews: CoachDetailReview[],
  fallbackAverage?: number,
  fallbackTotal?: number,
): CoachReviewSummary {
  const counts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const review of reviews) {
    const stars = Math.min(
      5,
      Math.max(1, Math.round(review.rating)),
    ) as 1 | 2 | 3 | 4 | 5;
    counts[stars] += 1;
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average =
    total > 0
      ? sum / total
      : typeof fallbackAverage === "number"
        ? fallbackAverage
        : 0;

  const denominator = total > 0 ? total : 1;

  return {
    average,
    total: total > 0 ? total : (fallbackTotal ?? 0),
    buckets: ([5, 4, 3, 2, 1] as const).map((stars) => ({
      stars,
      count: counts[stars],
      ratio: counts[stars] / denominator,
    })),
  };
}

export const COACH_REVIEW_FILTERS = [
  "all",
  "skill",
  "conversation",
  "attitude",
  "rude",
] as const;

export type CoachReviewFilterId = (typeof COACH_REVIEW_FILTERS)[number];
