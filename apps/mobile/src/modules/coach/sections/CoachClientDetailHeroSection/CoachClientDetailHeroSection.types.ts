import type { CoachClientDetail } from "../../lib/coach-clients-data";

export type CoachClientDetailHeroSectionProps = {
  client: Pick<
    CoachClientDetail,
    "name" | "avatar" | "goalLabel" | "levelLabel" | "engagement"
  >;
};
