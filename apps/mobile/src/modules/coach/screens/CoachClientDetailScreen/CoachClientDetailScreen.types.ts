import type { CoachClientDetail } from "../../lib/coach-clients-data";
import type { WorkoutLog } from "@repo/api";

export type CoachClientDetailScreenProps = {
  client: CoachClientDetail;
  messaging?: boolean;
  onSendMessage?: () => void | Promise<void>;
  workoutLogs?: WorkoutLog[];
  workoutLogsLoading?: boolean;
  workoutLogsError?: boolean;
  reviewingLogId?: string | null;
  onRetryWorkoutLogs?: () => void;
  onReviewWorkoutLog?: (logId: string, note: string) => Promise<void>;
};
