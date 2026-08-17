import type {
  AthleteWorkoutLogItem,
  AthleteWorkoutLogStatus,
} from "@/modules/athlete/lib/workout-programs-data";

export type AthleteWorkoutDetailLogsSectionProps = {
  title: string;
  emptyTitle: string;
  emptyBody: string;
  sessionLabel: (index: number) => string;
  setsCountLabel: (count: number) => string;
  logStatusLabel: (status: AthleteWorkoutLogStatus) => string;
  logs: AthleteWorkoutLogItem[];
  className?: string;
};
