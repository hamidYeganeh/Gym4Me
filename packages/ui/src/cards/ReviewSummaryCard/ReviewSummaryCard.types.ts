import type { CardProps } from "@heroui/react/card";
import type { ReactNode } from "react";

export type ReviewSummaryRatingBucket = {
  /** Star level from 1–5. */
  stars: 1 | 2 | 3 | 4 | 5;
  /** Absolute review count for this star level. */
  count: number;
  /** 0–1 share of total reviews. */
  ratio: number;
};

export type ReviewSummaryHighlight = {
  /** Stable key for the highlight row. */
  id: string;
  /** Leading icon (accent-colored by default). */
  icon: ReactNode;
  /** Highlight title, e.g. `Highly Recommended`. */
  title: ReactNode;
  /** Supporting line under the title. */
  description: ReactNode;
};

export type ReviewSummaryCardProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /** Large average value, e.g. `4.2`. */
  average: ReactNode;
  /** Label under the average, e.g. `Avg. Rating`. */
  averageLabel: ReactNode;
  /** Total users/reviews line, e.g. `1,215 users`. */
  usersLabel: ReactNode;
  /** Rating distribution rows (typically 5 → 1). */
  buckets: ReviewSummaryRatingBucket[];
  /** Optional insight rows under the distribution. */
  highlights?: ReviewSummaryHighlight[];
  /** Extra classes for the card root. */
  className?: string;
};
