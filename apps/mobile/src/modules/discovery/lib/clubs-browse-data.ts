import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type ClubSportFilterId = string;

export type ClubSportFilter = {
  id: ClubSportFilterId;
  label: string;
};

export type BrowseClub = {
  /** Matches ids in `club-detail-data` so detail routes resolve. */
  id: string;
  title: string;
  location: string;
  image: string;
  rating: number;
  ratingCount: number;
  price: string;
  featureLabels: string[];
  sportIds: Exclude<ClubSportFilterId, "all">[];
  distanceLabel: string;
  openState: "open" | "closed";
};

export const CLUB_SPORT_FILTERS: ClubSportFilter[] = [
  { id: "all", label: "همه" },
  { id: "fitness", label: "فیتنس" },
  { id: "crossfit", label: "کراس‌فیت" },
  { id: "yoga", label: "یوگا" },
  { id: "swimming", label: "شنا" },
  { id: "martial-arts", label: "رزمی" },
];

export const BROWSE_CLUBS: BrowseClub[] = [
  {
    id: "heavenly",
    title: "آسمانی فیتنس",
    location: "تهران، سعادت‌آباد",
    image: PLACEHOLDER_IMAGE,
    rating: 4.8,
    ratingCount: 146,
    price: "۲/۵ میلیون",
    featureLabels: ["پارکینگ", "کافه", "سونا", "شبانه‌روزی"],
    sportIds: ["fitness", "crossfit"],
    distanceLabel: "۱/۲ کیلومتر",
    openState: "open",
  },
  {
    id: "iron",
    title: "آیرون پارادایس",
    location: "تهران، ونک",
    image: PLACEHOLDER_IMAGE,
    rating: 4.6,
    ratingCount: 98,
    price: "۱/۸ میلیون",
    featureLabels: ["بدنسازی", "کمد اختصاصی", "شبانه‌روزی"],
    sportIds: ["fitness"],
    distanceLabel: "۲/۴ کیلومتر",
    openState: "open",
  },
  {
    id: "123",
    title: "باشگاه ۱۲۳",
    location: "اصفهان، مرداویج",
    image: PLACEHOLDER_IMAGE,
    rating: 4.4,
    ratingCount: 61,
    price: "۱/۲ میلیون",
    featureLabels: ["یوگا", "پیلاتس"],
    sportIds: ["yoga"],
    distanceLabel: "۳ کیلومتر",
    openState: "closed",
  },
  {
    id: "aqua-center",
    title: "مجموعه آبی موج",
    location: "تهران، شهرک غرب",
    image: PLACEHOLDER_IMAGE,
    rating: 4.7,
    ratingCount: 210,
    price: "۳ میلیون",
    featureLabels: ["استخر", "جکوزی", "سونا"],
    sportIds: ["swimming"],
    distanceLabel: "۴/۵ کیلومتر",
    openState: "open",
  },
  {
    id: "dragon-dojo",
    title: "آکادمی رزمی اژدها",
    location: "تهران، نارمک",
    image: PLACEHOLDER_IMAGE,
    rating: 4.5,
    ratingCount: 74,
    price: "۹۵۰ هزار",
    featureLabels: ["کیک‌بوکسینگ", "جودو"],
    sportIds: ["martial-arts"],
    distanceLabel: "۶ کیلومتر",
    openState: "open",
  },
  {
    id: "pulse-studio",
    title: "پالس استودیو",
    location: "تهران، جردن",
    image: PLACEHOLDER_IMAGE,
    rating: 4.9,
    ratingCount: 188,
    price: "۲/۹ میلیون",
    featureLabels: ["HIIT", "اسپینینگ", "شبانه‌روزی"],
    sportIds: ["fitness", "crossfit"],
    distanceLabel: "۱/۸ کیلومتر",
    openState: "open",
  },
  {
    id: "zen-flow",
    title: "زن فلو یوگا",
    location: "تهران، فرمانیه",
    image: PLACEHOLDER_IMAGE,
    rating: 4.7,
    ratingCount: 112,
    price: "۱/۵ میلیون",
    featureLabels: ["یوگا", "مدیتیشن"],
    sportIds: ["yoga"],
    distanceLabel: "۳/۲ کیلومتر",
    openState: "open",
  },
  {
    id: "forge-lab",
    title: "فورج لب",
    location: "اصفهان، جلفا",
    image: PLACEHOLDER_IMAGE,
    rating: 4.3,
    ratingCount: 54,
    price: "۱/۱ میلیون",
    featureLabels: ["قدرتی", "کالیس"],
    sportIds: ["fitness"],
    distanceLabel: "۵ کیلومتر",
    openState: "closed",
  },
];

/** Subset highlighted on the discovery landing page. */
export const FEATURED_CLUBS: BrowseClub[] = BROWSE_CLUBS.slice(0, 3);

export function sortClubsByRating(clubs: BrowseClub[]): BrowseClub[] {
  return [...clubs].sort((a, b) => b.rating - a.rating);
}

export function clubsOpenNow(clubs: BrowseClub[]): BrowseClub[] {
  return clubs.filter((club) => club.openState === "open");
}

export function clubsNearby(clubs: BrowseClub[]): BrowseClub[] {
  return [...clubs].sort((a, b) => {
    const da = Number.parseFloat(
      a.distanceLabel.replace(/[^\d./]/g, "").replace("/", "."),
    );
    const db = Number.parseFloat(
      b.distanceLabel.replace(/[^\d./]/g, "").replace("/", "."),
    );
    return (Number.isFinite(da) ? da : 99) - (Number.isFinite(db) ? db : 99);
  });
}

const OPEN_24H_LABEL = /شبانه|۲۴\s*ساع|24\s*h/i;

/** Clubs tagged as 24/7 (falls back to open-now when tags are missing). */
export function clubsOpen24Hours(clubs: BrowseClub[]): BrowseClub[] {
  const tagged = clubs.filter((club) =>
    club.featureLabels.some((label) => OPEN_24H_LABEL.test(label)),
  );
  return tagged.length > 0 ? tagged : clubsOpenNow(clubs);
}
