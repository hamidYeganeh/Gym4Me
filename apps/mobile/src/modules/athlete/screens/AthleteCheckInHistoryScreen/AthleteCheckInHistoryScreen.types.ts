import type { AthleteCheckInItem } from "@/modules/athlete/lib/checkin-history-data";

export type AthleteCheckInHistoryScreenProps = {
  items: AthleteCheckInItem[];
  className?: string;
};
