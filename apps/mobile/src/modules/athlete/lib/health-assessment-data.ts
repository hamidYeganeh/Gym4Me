export type HealthAssessmentStatus =
  | "unsubmitted"
  | "in_progress"
  | "submitted"
  | "reviewed";

export type HealthAssessmentAnswer = "yes" | "no" | null;

export type HealthAssessmentQuestion = {
  id: string;
  prompt: string;
};

export type HealthAssessmentState = {
  status: HealthAssessmentStatus;
  answers: Record<string, HealthAssessmentAnswer>;
};

export const HEALTH_ASSESSMENT_QUESTIONS: HealthAssessmentQuestion[] = [
  {
    id: "q1",
    prompt: "آیا پزشک به شما گفته که فقط با نظر پزشک ورزش کنید؟",
  },
  {
    id: "q2",
    prompt: "آیا هنگام فعالیت جسمی در قفسه سینه درد یا فشار احساس می‌کنید؟",
  },
  {
    id: "q3",
    prompt: "آیا در ماه گذشته بدون فعالیت جسمی، سرگیجه یا تنگی نفس داشته‌اید؟",
  },
  {
    id: "q4",
    prompt: "آیا استخوان یا مفصل مشکل دارید که با تغییر فعالیت بدتر شود؟",
  },
  {
    id: "q5",
    prompt: "آیا داروی فشار خون یا قلب مصرف می‌کنید؟",
  },
  {
    id: "q6",
    prompt: "آیا دلیل دیگری برای عدم انجام فعالیت بدنی دارید؟",
  },
];

export const DEFAULT_HEALTH_ASSESSMENT: HealthAssessmentState = {
  status: "in_progress",
  answers: {
    q1: "no",
    q2: "no",
    q3: null,
    q4: null,
    q5: null,
    q6: null,
  },
};
