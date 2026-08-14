import type { CoachProgramState } from "./coach-programs-data";
import { COACH_PROGRAMS } from "./coach-programs-data";

export type CoachProgramEditorExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
};

export type CoachProgramEditorSession = {
  id: string;
  title: string;
  exercises: CoachProgramEditorExercise[];
};

export type CoachProgramEditorDay = {
  id: string;
  label: string;
  sessions: CoachProgramEditorSession[];
};

export type CoachProgramEditorWeek = {
  id: string;
  label: string;
  days: CoachProgramEditorDay[];
};

export type CoachProgramEditorDetail = {
  id: string;
  title: string;
  focusLabel: string;
  state: CoachProgramState;
  weeks: CoachProgramEditorWeek[];
};

const EDITOR_DETAILS: Record<string, CoachProgramEditorDetail> = {
  p1: {
    id: "p1",
    title: "چربی‌سوزی ۸ هفته‌ای",
    focusLabel: "کاهش وزن و کاردیو",
    state: "published",
    weeks: [
      {
        id: "w1",
        label: "هفته ۱",
        days: [
          {
            id: "d1",
            label: "روز ۱ — کاردیو",
            sessions: [
              {
                id: "s1",
                title: "جلسه صبح",
                exercises: [
                  { id: "e1", name: "دویدن تردمیل", sets: "۱", reps: "۲۰ دقیقه" },
                  { id: "e2", name: "پرش باکس", sets: "۴", reps: "۱۵" },
                ],
              },
            ],
          },
          {
            id: "d2",
            label: "روز ۲ — قدرت",
            sessions: [
              {
                id: "s2",
                title: "جلسه اصلی",
                exercises: [
                  { id: "e3", name: "اسکات", sets: "۴", reps: "۱۲" },
                  { id: "e4", name: "پرس سینه", sets: "۳", reps: "۱۰" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "w2",
        label: "هفته ۲",
        days: [
          {
            id: "d3",
            label: "روز ۱ — HIIT",
            sessions: [
              {
                id: "s3",
                title: "تمرین اینتروال",
                exercises: [
                  { id: "e5", name: "برپی", sets: "۵", reps: "۱۰" },
                  { id: "e6", name: "پلانک", sets: "۳", reps: "۴۵ ثانیه" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  p2: {
    id: "p2",
    title: "قدرت پایه با هالتر",
    focusLabel: "قدرتی و پاورلیفتینگ",
    state: "published",
    weeks: [
      {
        id: "w1",
        label: "هفته ۱",
        days: [
          {
            id: "d1",
            label: "روز ۱ — پایین‌تنه",
            sessions: [
              {
                id: "s1",
                title: "اسکات و ددلیفت",
                exercises: [
                  { id: "e1", name: "اسکات پشت", sets: "۵", reps: "۵" },
                  { id: "e2", name: "ددلیفت رومانیایی", sets: "۴", reps: "۸" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  p3: {
    id: "p3",
    title: "آمادگی جسمانی مبتدی",
    focusLabel: "تمرین عمومی بدن",
    state: "draft",
    weeks: [
      {
        id: "w1",
        label: "هفته ۱",
        days: [
          {
            id: "d1",
            label: "روز ۱ — تمام بدن",
            sessions: [
              {
                id: "s1",
                title: "جلسه پایه",
                exercises: [
                  { id: "e1", name: "پوش‌آپ زانو", sets: "۳", reps: "۱۰" },
                  { id: "e2", name: "اسکات بدون وزنه", sets: "۳", reps: "۱۵" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

function buildFallbackDetail(programId: string): CoachProgramEditorDetail | null {
  const program = COACH_PROGRAMS.find((item) => item.id === programId);
  if (!program) return null;
  return {
    id: program.id,
    title: program.title,
    focusLabel: program.focusLabel,
    state: program.state,
    weeks: EDITOR_DETAILS.p3.weeks,
  };
}

export function getAllCoachProgramIds(): string[] {
  return COACH_PROGRAMS.map((program) => program.id);
}

export function getCoachProgramEditorDetail(
  programId: string,
): CoachProgramEditorDetail | null {
  return EDITOR_DETAILS[programId] ?? buildFallbackDetail(programId);
}
