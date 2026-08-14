import type {
  HealthAssessmentAnswer,
  HealthAssessmentQuestion,
  HealthAssessmentStatus,
} from "../../lib/health-assessment-data";

export type AthleteHealthAssessmentScreenProps = {
  status: HealthAssessmentStatus;
  questions: HealthAssessmentQuestion[];
  answers: Record<string, HealthAssessmentAnswer>;
  pending?: boolean;
  message?: string | null;
  error?: string | null;
  onAnswer: (questionId: string, answer: HealthAssessmentAnswer) => void;
  onSubmit: () => void | Promise<void>;
  className?: string;
};
