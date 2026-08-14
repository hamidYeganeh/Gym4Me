export type CoachVideoFeedbackStatus = "awaiting_review" | "reviewed";

export type CoachVideoSubmission = {
  id: string;
  athleteName: string;
  exerciseName: string;
  submittedLabel: string;
  status: CoachVideoFeedbackStatus;
  reviewNote: string;
  thumbnailLabel: string;
};

export const COACH_VIDEO_SUBMISSIONS: CoachVideoSubmission[] = [
  {
    id: "vid1",
    athleteName: "امیر حسینی",
    exerciseName: "اسکات با هالتر",
    submittedLabel: "ارسال ۳ ساعت پیش",
    status: "awaiting_review",
    reviewNote: "",
    thumbnailLabel: "ویدیو ۰:۴۵",
  },
  {
    id: "vid2",
    athleteName: "سارا رضایی",
    exerciseName: "ددلیفت رومانیایی",
    submittedLabel: "ارسال دیروز",
    status: "awaiting_review",
    reviewNote: "",
    thumbnailLabel: "ویدیو ۱:۱۲",
  },
  {
    id: "vid3",
    athleteName: "رضا کریمی",
    exerciseName: "پرس سینه",
    submittedLabel: "ارسال ۳ روز پیش",
    status: "reviewed",
    reviewNote: "آرنج را کمی بازتر نگه دار. عمق حرکت خوب است.",
    thumbnailLabel: "ویدیو ۰:۳۸",
  },
  {
    id: "vid4",
    athleteName: "مریم صادقی",
    exerciseName: "لانج راه رفتن",
    submittedLabel: "ارسال ۱ هفته پیش",
    status: "reviewed",
    reviewNote: "زانو جلوتر از پنجه نرود. تعادل عالی.",
    thumbnailLabel: "ویدیو ۱:۰۵",
  },
];
