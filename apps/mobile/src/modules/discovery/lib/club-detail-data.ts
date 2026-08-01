import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type ClubDetailStat = {
  labelKey: "duration" | "difficulty" | "rating";
  value: string;
};

export type ClubDetail = {
  id: string;
  title: string;
  location: string;
  images: string[];
  stats: ClubDetailStat[];
  overview: string;
  price: string;
  isFavorite?: boolean;
};

const DEFAULT_IMAGES = [
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
] as const;

const CLUBS: Record<string, ClubDetail> = {
  heavenly: {
    id: "heavenly",
    title: "Heavenly Fitness",
    location: "Tehran, Iran",
    images: [...DEFAULT_IMAGES],
    stats: [
      { labelKey: "duration", value: "18 Hours" },
      { labelKey: "difficulty", value: "All Levels" },
      { labelKey: "rating", value: "4.9" },
    ],
    overview:
      "Train in a premium multi-level gym with Olympic lifting platforms, recovery suites, and coach-led classes. Experience world-class equipment, sharp programming, and a community that pushes you to your peak.",
    price: "$1299",
    isFavorite: false,
  },
  iron: {
    id: "iron",
    title: "Iron Paradise",
    location: "Isfahan, Iran",
    images: [...DEFAULT_IMAGES],
    stats: [
      { labelKey: "duration", value: "16 Hours" },
      { labelKey: "difficulty", value: "Advanced" },
      { labelKey: "rating", value: "4.7" },
    ],
    overview:
      "A strength-first club built for serious lifters. Heavy free weights, dedicated power racks, and expert coaches focused on progressive overload and form.",
    price: "$899",
    isFavorite: true,
  },
  "123": {
    id: "123",
    title: "Club 123",
    location: "Tehran, Iran",
    images: [...DEFAULT_IMAGES],
    stats: [
      { labelKey: "duration", value: "14 Hours" },
      { labelKey: "difficulty", value: "Beginner" },
      { labelKey: "rating", value: "4.5" },
    ],
    overview:
      "A neighborhood gym with modern machines, group classes, and coaches ready to help you build a consistent training habit.",
    price: "$499",
    isFavorite: false,
  },
};

function titleFromClubId(clubId: string): string {
  return clubId
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createFallbackClub(clubId: string): ClubDetail {
  const title = titleFromClubId(clubId) || `Club ${clubId}`;

  return {
    id: clubId,
    title,
    location: "Tehran, Iran",
    images: [...DEFAULT_IMAGES],
    stats: [
      { labelKey: "duration", value: "12 Hours" },
      { labelKey: "difficulty", value: "All Levels" },
      { labelKey: "rating", value: "4.6" },
    ],
    overview: `Discover ${title} — equipment, classes, and coaching designed for every training goal.`,
    price: "$799",
    isFavorite: false,
  };
}

export function getClubDetail(clubId: string): ClubDetail | undefined {
  const id = clubId.trim();
  if (!id) return undefined;
  return CLUBS[id] ?? createFallbackClub(id);
}

/** Club IDs pre-rendered for Capacitor static export (`output: "export"`). */
export function getAllClubIds(): string[] {
  return Object.keys(CLUBS);
}
