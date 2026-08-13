export type CoachMessageThread = {
  id: string;
  athleteUserId: string;
  title: string;
  preview: string;
  updatedLabel: string;
};

export type CoachChatMessage = {
  id: string;
  body: string;
  sentAtLabel: string;
  fromCoach: boolean;
};

export const COACH_MESSAGE_THREADS: CoachMessageThread[] = [
  {
    id: "t1",
    athleteUserId: "demo-athlete-1",
    title: "نگار احمدی",
    preview: "فردا همون ساعت بیام؟",
    updatedLabel: "۱۰ دقیقه پیش",
  },
  {
    id: "t2",
    athleteUserId: "demo-athlete-2",
    title: "علی رضایی",
    preview: "برنامه هفته بعد آماده‌ست؟",
    updatedLabel: "دیروز",
  },
  {
    id: "t3",
    athleteUserId: "demo-athlete-3",
    title: "مریم کریمی",
    preview: "ممنون از پیگیری‌تون",
    updatedLabel: "۳ روز پیش",
  },
];

export const COACH_THREAD_MESSAGES: Record<string, CoachChatMessage[]> = {
  t1: [
    {
      id: "m1",
      body: "سلام مربی، فردا همون ساعت بیام؟",
      sentAtLabel: "۱۸:۴۲",
      fromCoach: false,
    },
    {
      id: "m2",
      body: "بله نگار، ۱۷:۰۰ باشگاه منتظرتم.",
      sentAtLabel: "۱۸:۴۵",
      fromCoach: true,
    },
  ],
  t2: [
    {
      id: "m3",
      body: "برنامه هفته بعد آماده‌ست؟",
      sentAtLabel: "دیروز",
      fromCoach: false,
    },
  ],
  t3: [
    {
      id: "m4",
      body: "ممنون از پیگیری‌تون",
      sentAtLabel: "۳ روز پیش",
      fromCoach: false,
    },
  ],
};

export function getCoachThread(threadId: string): CoachMessageThread | undefined {
  return COACH_MESSAGE_THREADS.find((thread) => thread.id === threadId);
}

export function getCoachThreadMessages(threadId: string): CoachChatMessage[] {
  return COACH_THREAD_MESSAGES[threadId] ?? [];
}
