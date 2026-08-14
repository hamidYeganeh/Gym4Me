import type { CoachVideoSubmission } from "../../lib/coach-video-feedback-data";

export type CoachVideoFeedbackScreenProps = {
  submissions: CoachVideoSubmission[];
  reviewingId?: string | null;
  onSubmitReview?: (submissionId: string, note: string) => void | Promise<void>;
};
