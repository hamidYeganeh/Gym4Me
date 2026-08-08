import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { LocationNode, SportNode } from "@repo/api";

export type HomeLocationItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  subtitle?: string;
};

export type HomeSportItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image?: string;
};

export type HomeClassItem = {
  id: string;
  clubId: string;
  title: string;
  author: string;
  category: string;
  date: string;
  duration: string;
  backgroundImage?: string;
};

export function mapLocationToHomeItem(
  node: LocationNode,
  imageFallback = PLACEHOLDER_IMAGE,
  subtitle?: string,
): HomeLocationItem {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    image: imageFallback,
    subtitle,
  };
}

export function mapSportToHomeItem(
  node: SportNode,
  image?: string,
): HomeSportItem {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    description: node.description,
    image,
  };
}

export const MOCK_PROVINCES: HomeLocationItem[] = [
  {
    id: "mock-tehran-province",
    name: "تهران",
    slug: "tehran",
    image: PLACEHOLDER_IMAGE,
    subtitle: "استان",
  },
  {
    id: "mock-isfahan-province",
    name: "اصفهان",
    slug: "isfahan",
    image: PLACEHOLDER_IMAGE,
    subtitle: "استان",
  },
];

export const MOCK_CITIES: HomeLocationItem[] = [
  {
    id: "mock-tehran-city",
    name: "تهران",
    slug: "tehran-city",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "mock-isfahan-city",
    name: "اصفهان",
    slug: "isfahan-city",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "mock-shiraz-city",
    name: "شیراز",
    slug: "shiraz-city",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "mock-mashhad-city",
    name: "مشهد",
    slug: "mashhad-city",
    image: PLACEHOLDER_IMAGE,
  },
];

export const MOCK_DISTRICTS: HomeLocationItem[] = [
  {
    id: "mock-vanak",
    name: "ونک",
    slug: "vanak",
    image: PLACEHOLDER_IMAGE,
    subtitle: "تهران",
  },
  {
    id: "mock-saadat",
    name: "سعادت‌آباد",
    slug: "saadat-abad",
    image: PLACEHOLDER_IMAGE,
    subtitle: "تهران",
  },
  {
    id: "mock-jordan",
    name: "جردن",
    slug: "jordan",
    image: PLACEHOLDER_IMAGE,
    subtitle: "تهران",
  },
  {
    id: "mock-narmak",
    name: "نارمک",
    slug: "narmak",
    image: PLACEHOLDER_IMAGE,
    subtitle: "تهران",
  },
  {
    id: "mock-jolfa",
    name: "جلفا",
    slug: "jolfa",
    image: PLACEHOLDER_IMAGE,
    subtitle: "اصفهان",
  },
];

/** Extra provinces for richer discovery carousels. */
export const MOCK_PROVINCES_EXTENDED: HomeLocationItem[] = [
  ...MOCK_PROVINCES,
  {
    id: "mock-fars-province",
    name: "فارس",
    slug: "fars",
    image: PLACEHOLDER_IMAGE,
    subtitle: "استان",
  },
  {
    id: "mock-razavi-province",
    name: "خراسان رضوی",
    slug: "razavi-khorasan",
    image: PLACEHOLDER_IMAGE,
    subtitle: "استان",
  },
];

export const MOCK_SPORT_CATEGORIES: HomeSportItem[] = [
  {
    id: "mock-ball",
    name: "ورزش‌های توپی",
    slug: "ball-sports",
    description: null,
  },
  {
    id: "mock-fitness",
    name: "آمادگی جسمانی",
    slug: "fitness",
    description: null,
  },
  {
    id: "mock-combat",
    name: "رزمی",
    slug: "combat",
    description: null,
  },
];

export const MOCK_SPORTS: HomeSportItem[] = [
  {
    id: "mock-football",
    name: "فوتبال",
    slug: "football",
    description: "ورزش‌های توپی",
  },
  {
    id: "mock-gym",
    name: "بدنسازی",
    slug: "bodybuilding",
    description: "آمادگی جسمانی",
  },
  {
    id: "mock-yoga",
    name: "یوگا",
    slug: "yoga",
    description: "آمادگی جسمانی",
  },
];
