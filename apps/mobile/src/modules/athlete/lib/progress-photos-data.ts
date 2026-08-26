export type ProgressPhotoPrivacy =
  | "private"
  | "coach_only"
  | "followers"
  | "public";

export type ProgressPhotoItem = {
  id: string;
  imageUrl?: string;
  takenAtLabel: string;
  note?: string;
  privacy: ProgressPhotoPrivacy;
};

export const PROGRESS_PHOTOS: ProgressPhotoItem[] = [
  {
    id: "p1",
    takenAtLabel: "۱۴۰۴/۰۵/۲۰",
    note: "پشت — هفته ۴",
    privacy: "coach_only",
  },
  {
    id: "p2",
    takenAtLabel: "۱۴۰۴/۰۵/۱۳",
    note: "جلو — هفته ۳",
    privacy: "private",
  },
  {
    id: "p3",
    takenAtLabel: "۱۴۰۴/۰۵/۰۶",
    privacy: "followers",
  },
];

export function createMockProgressPhoto(
  note?: string,
): ProgressPhotoItem {
  return {
    id: `local-${Date.now()}`,
    takenAtLabel: new Date().toLocaleDateString("fa-IR"),
    note,
    privacy: "private",
  };
}
