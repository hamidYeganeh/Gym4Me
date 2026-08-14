export type CoachProgramRevision = {
  id: string;
  label: string;
  createdAtLabel: string;
  addedLines: string[];
  removedLines: string[];
};

const REVISIONS: Record<string, CoachProgramRevision[]> = {
  p1: [
    {
      id: "r3",
      label: "نسخه ۳ — افزودن HIIT",
      createdAtLabel: "۱۴۰۳/۰۵/۲۱",
      addedLines: [
        "هفته ۲ / روز ۱: برپی ۵×۱۰",
        "هفته ۲ / روز ۱: پلانک ۳×۴۵ ثانیه",
      ],
      removedLines: [],
    },
    {
      id: "r2",
      label: "نسخه ۲ — تنظیم حجم",
      createdAtLabel: "۱۴۰۳/۰۵/۱۴",
      addedLines: ["هفته ۱ / روز ۲: پرس سینه ۳×۱۰"],
      removedLines: ["هفته ۱ / روز ۲: پرس سینه ۴×۸"],
    },
    {
      id: "r1",
      label: "نسخه ۱ — انتشار اولیه",
      createdAtLabel: "۱۴۰۳/۰۵/۰۱",
      addedLines: [
        "هفته ۱ / روز ۱: دویدن تردمیل ۱×۲۰ دقیقه",
        "هفته ۱ / روز ۱: پرش باکس ۴×۱۵",
        "هفته ۱ / روز ۲: اسکات ۴×۱۲",
      ],
      removedLines: [],
    },
  ],
  p2: [
    {
      id: "r2",
      label: "نسخه ۲ — افزایش شدت",
      createdAtLabel: "۱۴۰۳/۰۴/۲۸",
      addedLines: ["هفته ۱ / روز ۱: ددلیفت رومانیایی ۴×۸"],
      removedLines: ["هفته ۱ / روز ۱: ددلیفت رومانیایی ۳×۱۰"],
    },
    {
      id: "r1",
      label: "نسخه ۱ — انتشار اولیه",
      createdAtLabel: "۱۴۰۳/۰۴/۱۰",
      addedLines: ["هفته ۱ / روز ۱: اسکات پشت ۵×۵"],
      removedLines: [],
    },
  ],
  p3: [
    {
      id: "r1",
      label: "نسخه ۱ — پیش‌نویس اولیه",
      createdAtLabel: "۱۴۰۳/۰۵/۲۵",
      addedLines: [
        "هفته ۱ / روز ۱: پوش‌آپ زانو ۳×۱۰",
        "هفته ۱ / روز ۱: اسکات بدون وزنه ۳×۱۵",
      ],
      removedLines: [],
    },
  ],
};

const DEFAULT_REVISIONS: CoachProgramRevision[] = [
  {
    id: "r1",
    label: "نسخه ۱ — پیش‌نویس",
    createdAtLabel: "۱۴۰۳/۰۵/۲۵",
    addedLines: ["ساختار اولیه برنامه ایجاد شد."],
    removedLines: [],
  },
];

export function getCoachProgramRevisions(
  programId: string,
): CoachProgramRevision[] {
  return REVISIONS[programId] ?? DEFAULT_REVISIONS;
}
