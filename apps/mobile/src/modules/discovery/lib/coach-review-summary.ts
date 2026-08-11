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

/** Demo-friendly distribution when only a few review samples exist. */
const DEMO_BUCKET_WEIGHTS = [200, 95, 52, 21, 8] as const;

function bucketsFromCounts(
  counts: Record<1 | 2 | 3 | 4 | 5, number>,
  total: number,
): CoachRatingBucket[] {
  const denominator = total > 0 ? total : 1;
  return ([5, 4, 3, 2, 1] as const).map((stars) => ({
    stars,
    count: counts[stars],
    ratio: counts[stars] / denominator,
  }));
}

function scaledDemoBuckets(total: number): CoachRatingBucket[] {
  const weightSum = DEMO_BUCKET_WEIGHTS.reduce((sum, value) => sum + value, 0);
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
    1 | 2 | 3 | 4 | 5,
    number
  >;
  ([5, 4, 3, 2, 1] as const).forEach((stars, index) => {
    counts[stars] = Math.round(
      (DEMO_BUCKET_WEIGHTS[index]! / weightSum) * total,
    );
  });
  return bucketsFromCounts(counts, total);
}

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

  const sampleTotal = reviews.length;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average =
    sampleTotal > 0
      ? sum / sampleTotal
      : typeof fallbackAverage === "number"
        ? fallbackAverage
        : 0;

  const displayTotal =
    typeof fallbackTotal === "number" && fallbackTotal > sampleTotal
      ? fallbackTotal
      : sampleTotal > 0
        ? sampleTotal
        : (fallbackTotal ?? 0);

  const useDemoDistribution =
    sampleTotal > 0 &&
    typeof fallbackTotal === "number" &&
    fallbackTotal > sampleTotal * 3;

  return {
    average,
    total: displayTotal,
    buckets: useDemoDistribution
      ? scaledDemoBuckets(displayTotal)
      : bucketsFromCounts(counts, sampleTotal > 0 ? sampleTotal : displayTotal),
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
