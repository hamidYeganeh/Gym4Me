export type AthleteMessageThread = {
  id: string;
  coachUserId: string;
  title: string;
  preview: string;
  updatedLabel: string;
};

export type AthleteChatMessage = {
  id: string;
  body: string;
  sentAtLabel: string;
  fromAthlete: boolean;
};

export const ATHLETE_MESSAGE_THREADS: AthleteMessageThread[] = [
  {
    id: "t1",
    coachUserId: "demo-coach-1",
    title: "رضا محمدی",
    preview: "برنامه هفته بعد آماده‌ست.",
    updatedLabel: "۱۰ دقیقه پیش",
  },
  {
    id: "t2",
    coachUserId: "demo-coach-2",
    title: "سارا نوری",
    preview: "فردا همون ساعت بیام؟",
    updatedLabel: "دیروز",
  },
  {
    id: "t3",
    coachUserId: "demo-coach-3",
    title: "امیر حسینی",
    preview: "ممنون از پیگیری‌تون",
    updatedLabel: "۳ روز پیش",
  },
];

export const ATHLETE_THREAD_MESSAGES: Record<string, AthleteChatMessage[]> = {
  t1: [
    {
      id: "m1",
      body: "سلام مربی، برنامه هفته بعد آماده‌ست؟",
      sentAtLabel: "۱۸:۴۲",
      fromAthlete: true,
    },
    {
      id: "m2",
      body: "بله، امشب برات می‌فرستم.",
      sentAtLabel: "۱۸:۴۵",
      fromAthlete: false,
    },
  ],
  t2: [
    {
      id: "m3",
      body: "فردا همون ساعت بیام؟",
      sentAtLabel: "دیروز",
      fromAthlete: true,
    },
  ],
  t3: [
    {
      id: "m4",
      body: "ممنون از پیگیری‌تون",
      sentAtLabel: "۳ روز پیش",
      fromAthlete: true,
    },
  ],
};

export function getAthleteThread(
  threadId: string,
): AthleteMessageThread | undefined {
  return ATHLETE_MESSAGE_THREADS.find((thread) => thread.id === threadId);
}

export function getAthleteThreadMessages(
  threadId: string,
): AthleteChatMessage[] {
  return ATHLETE_THREAD_MESSAGES[threadId] ?? [];
}
