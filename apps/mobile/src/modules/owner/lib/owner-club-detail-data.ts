export type OwnerClubBranchState = "active" | "maintenance";
export type OwnerClubClassState = "active" | "paused";

export type OwnerClubDetailBranch = {
  id: string;
  name: string;
  address: string;
  capacityLabel: string;
  state: OwnerClubBranchState;
};

export type OwnerClubDetailClass = {
  id: string;
  title: string;
  coach: string;
  scheduleLabel: string;
  enrolled: number;
  capacity: number;
  state: OwnerClubClassState;
};

export type OwnerClubDetailSlotDay = {
  id: string;
  dayLabel: string;
  slotCountLabel: string;
  peakHoursLabel: string;
};

export type OwnerClubDetailTodayRow = {
  id: "check-ins" | "new-members" | "bookings";
  value: string;
};

export type OwnerClubDetail = {
  id: string;
  name: string;
  city: string;
  revenueValue: number;
  revenueSeries: number[];
  revenueComparisonSeries: number[];
  attendanceValue: number;
  attendanceSeries: number[];
  occupancyTrend: { label: string; value: number }[];
  today: OwnerClubDetailTodayRow[];
  branches: OwnerClubDetailBranch[];
  classes: OwnerClubDetailClass[];
  slotDays: OwnerClubDetailSlotDay[];
};

const DEFAULT_OCCUPANCY_TREND = [
  { label: "شنبه", value: 58 },
  { label: "یکشنبه", value: 64 },
  { label: "دوشنبه", value: 61 },
  { label: "سه‌شنبه", value: 72 },
  { label: "چهارشنبه", value: 68 },
  { label: "پنجشنبه", value: 83 },
  { label: "جمعه", value: 47 },
];

const DEFAULT_BRANCHES: OwnerClubDetailBranch[] = [
  {
    id: "vanak",
    name: "شعبه ونک",
    address: "تهران، میدان ونک، خیابان ملاصدرا",
    capacityLabel: "ظرفیت ۱۲۰ نفر",
    state: "active",
  },
  {
    id: "saadat",
    name: "شعبه سعادت‌آباد",
    address: "تهران، سعادت‌آباد، بلوار دریا",
    capacityLabel: "ظرفیت ۸۰ نفر",
    state: "active",
  },
  {
    id: "jordan",
    name: "شعبه جردن",
    address: "تهران، بلوار آفریقا، کوچه گلفام",
    capacityLabel: "ظرفیت ۶۰ نفر",
    state: "maintenance",
  },
];

const DEFAULT_CLASSES: OwnerClubDetailClass[] = [
  {
    id: "power-hiit",
    title: "پاور HIIT",
    coach: "سارا محمدی",
    scheduleLabel: "شنبه و دوشنبه، ۱۸:۰۰",
    enrolled: 18,
    capacity: 20,
    state: "active",
  },
  {
    id: "strength-circuit",
    title: "سیرکت قدرتی",
    coach: "علی رضایی",
    scheduleLabel: "یکشنبه و سه‌شنبه، ۱۹:۳۰",
    enrolled: 14,
    capacity: 16,
    state: "active",
  },
  {
    id: "yoga-flow",
    title: "یوگا فلو",
    coach: "نیکا احمدی",
    scheduleLabel: "دوشنبه و چهارشنبه، ۰۸:۰۰",
    enrolled: 9,
    capacity: 15,
    state: "active",
  },
  {
    id: "spin-burn",
    title: "اسپین برن",
    coach: "مهدی کریمی",
    scheduleLabel: "پنجشنبه، ۱۷:۰۰",
    enrolled: 4,
    capacity: 12,
    state: "paused",
  },
];

const DEFAULT_SLOT_DAYS: OwnerClubDetailSlotDay[] = [
  {
    id: "sat",
    dayLabel: "شنبه",
    slotCountLabel: "۸ سانس",
    peakHoursLabel: "اوج: ۱۸ تا ۲۱",
  },
  {
    id: "sun",
    dayLabel: "یکشنبه",
    slotCountLabel: "۶ سانس",
    peakHoursLabel: "اوج: ۱۷ تا ۲۰",
  },
  {
    id: "mon",
    dayLabel: "دوشنبه",
    slotCountLabel: "۸ سانس",
    peakHoursLabel: "اوج: ۱۸ تا ۲۱",
  },
  {
    id: "tue",
    dayLabel: "سه‌شنبه",
    slotCountLabel: "۷ سانس",
    peakHoursLabel: "اوج: ۱۹ تا ۲۲",
  },
  {
    id: "wed",
    dayLabel: "چهارشنبه",
    slotCountLabel: "۶ سانس",
    peakHoursLabel: "اوج: ۱۷ تا ۲۰",
  },
  {
    id: "thu",
    dayLabel: "پنجشنبه",
    slotCountLabel: "۹ سانس",
    peakHoursLabel: "اوج: ۱۶ تا ۲۱",
  },
  {
    id: "fri",
    dayLabel: "جمعه",
    slotCountLabel: "۴ سانس",
    peakHoursLabel: "اوج: ۱۰ تا ۱۳",
  },
];

const CLUBS: Record<string, OwnerClubDetail> = {
  heavenly: {
    id: "heavenly",
    name: "آسمانی فیتنس",
    city: "تهران",
    revenueValue: 42,
    revenueSeries: [22, 28, 26, 34, 31, 39, 42],
    revenueComparisonSeries: [18, 22, 24, 26, 25, 30, 33],
    attendanceValue: 132,
    attendanceSeries: [64, 82, 75, 98, 88, 120, 132],
    occupancyTrend: DEFAULT_OCCUPANCY_TREND,
    today: [
      { id: "check-ins", value: "۱۳۲" },
      { id: "new-members", value: "۷" },
      { id: "bookings", value: "۴۶" },
    ],
    branches: DEFAULT_BRANCHES,
    classes: DEFAULT_CLASSES,
    slotDays: DEFAULT_SLOT_DAYS,
  },
  pulse: {
    id: "pulse",
    name: "پالس فیت",
    city: "اصفهان",
    revenueValue: 18,
    revenueSeries: [8, 11, 10, 13, 12, 16, 18],
    revenueComparisonSeries: [7, 9, 9, 11, 10, 12, 14],
    attendanceValue: 58,
    attendanceSeries: [30, 36, 33, 44, 40, 52, 58],
    occupancyTrend: [
      { label: "شنبه", value: 41 },
      { label: "یکشنبه", value: 46 },
      { label: "دوشنبه", value: 44 },
      { label: "سه‌شنبه", value: 52 },
      { label: "چهارشنبه", value: 49 },
      { label: "پنجشنبه", value: 61 },
      { label: "جمعه", value: 33 },
    ],
    today: [
      { id: "check-ins", value: "۵۸" },
      { id: "new-members", value: "۳" },
      { id: "bookings", value: "۲۱" },
    ],
    branches: DEFAULT_BRANCHES.slice(0, 1),
    classes: DEFAULT_CLASSES.slice(0, 3),
    slotDays: DEFAULT_SLOT_DAYS,
  },
  titan: {
    id: "titan",
    name: "تایتان کلاب",
    city: "شیراز",
    revenueValue: 6,
    revenueSeries: [1, 2, 2, 3, 4, 5, 6],
    revenueComparisonSeries: [0, 1, 1, 2, 2, 3, 4],
    attendanceValue: 24,
    attendanceSeries: [8, 12, 10, 16, 14, 20, 24],
    occupancyTrend: [
      { label: "شنبه", value: 18 },
      { label: "یکشنبه", value: 21 },
      { label: "دوشنبه", value: 19 },
      { label: "سه‌شنبه", value: 24 },
      { label: "چهارشنبه", value: 22 },
      { label: "پنجشنبه", value: 28 },
      { label: "جمعه", value: 12 },
    ],
    today: [
      { id: "check-ins", value: "۲۴" },
      { id: "new-members", value: "۲" },
      { id: "bookings", value: "۹" },
    ],
    branches: DEFAULT_BRANCHES.slice(0, 2),
    classes: DEFAULT_CLASSES.slice(0, 2),
    slotDays: DEFAULT_SLOT_DAYS,
  },
  aria: {
    id: "aria",
    name: "آریا اسپرت",
    city: "تهران",
    revenueValue: 0,
    revenueSeries: [4, 3, 3, 2, 1, 0, 0],
    revenueComparisonSeries: [6, 5, 5, 4, 3, 2, 2],
    attendanceValue: 0,
    attendanceSeries: [12, 10, 8, 6, 4, 2, 0],
    occupancyTrend: [
      { label: "شنبه", value: 9 },
      { label: "یکشنبه", value: 8 },
      { label: "دوشنبه", value: 7 },
      { label: "سه‌شنبه", value: 6 },
      { label: "چهارشنبه", value: 4 },
      { label: "پنجشنبه", value: 3 },
      { label: "جمعه", value: 2 },
    ],
    today: [
      { id: "check-ins", value: "۰" },
      { id: "new-members", value: "۰" },
      { id: "bookings", value: "۰" },
    ],
    branches: DEFAULT_BRANCHES.slice(2, 3),
    classes: [DEFAULT_CLASSES[3] as OwnerClubDetailClass],
    slotDays: DEFAULT_SLOT_DAYS.slice(0, 5),
  },
};

function titleFromClubId(clubId: string): string {
  return clubId
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createFallbackClub(clubId: string): OwnerClubDetail {
  const name = titleFromClubId(clubId) || `Club ${clubId}`;

  return {
    id: clubId,
    name,
    city: "تهران",
    revenueValue: 12,
    revenueSeries: [5, 7, 6, 9, 8, 11, 12],
    revenueComparisonSeries: [4, 5, 5, 7, 6, 8, 9],
    attendanceValue: 42,
    attendanceSeries: [18, 24, 21, 30, 27, 38, 42],
    occupancyTrend: DEFAULT_OCCUPANCY_TREND,
    today: [
      { id: "check-ins", value: "۴۲" },
      { id: "new-members", value: "۲" },
      { id: "bookings", value: "۱۵" },
    ],
    branches: DEFAULT_BRANCHES.slice(0, 2),
    classes: DEFAULT_CLASSES.slice(0, 3),
    slotDays: DEFAULT_SLOT_DAYS,
  };
}

export function getOwnerClubDetail(
  clubId: string,
): OwnerClubDetail | undefined {
  const id = clubId.trim();
  if (!id) return undefined;
  return CLUBS[id] ?? createFallbackClub(id);
}

/** Club IDs pre-rendered for Capacitor static export (`output: "export"`). */
export function getAllOwnerClubIds(): string[] {
  return Object.keys(CLUBS);
}
