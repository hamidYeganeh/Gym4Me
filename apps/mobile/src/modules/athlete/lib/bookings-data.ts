export type BookingStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "REFUND_REQUESTED"
  | "REFUNDED"
  | "REJECTED";

export type BookingKind = "session" | "class" | "space" | "coach";

export type AthleteBookingCoach = {
  name: string;
  verification: "verified" | "unverified";
  specialtyLabel?: string;
  rating?: number;
  ratingCount?: number;
};

export type AthleteBooking = {
  id: string;
  kind: BookingKind;
  title: string;
  clubName: string;
  coach?: AthleteBookingCoach;
  /** Combined date + time label for list cards. */
  datetimeLabel: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  priceLabel: string;
  status: BookingStatus;
  checkInCode?: string;
  invoiceId?: string;
  /** Present when the booking is backed by the live API (enables real actions). */
  api?: {
    resourceType: "coach" | "session" | "class" | "space";
    /** Coach bookings only. */
    coachUserId: string | null;
    consultationKind: "in_person" | "remote" | null;
    /** Club bookings only — occurrence date (YYYY-MM-DD). */
    occurrenceDate: string | null;
    recurringGroupId: string | null;
  };
};

export const ATHLETE_BOOKINGS: AthleteBooking[] = [
  {
    id: "bk-101",
    kind: "session",
    title: "جلسه بدنسازی اختصاصی",
    clubName: "باشگاه انرژی",
    coach: {
      name: "مربی سارا محمدی",
      verification: "verified",
      specialtyLabel: "بدنسازی",
      rating: 4.8,
      ratingCount: 214,
    },
    datetimeLabel: "شنبه ۱۸ مرداد، ۱۸:۰۰",
    dateLabel: "شنبه ۱۸ مرداد ۱۴۰۵",
    timeLabel: "۱۸:۰۰ تا ۱۹:۳۰",
    locationLabel: "تهران، سعادت‌آباد، سالن ۲",
    priceLabel: "۴۵۰٬۰۰۰ تومان",
    status: "CONFIRMED",
    checkInCode: "۴۸۲۹۳۱",
    invoiceId: "inv-1001",
  },
  {
    id: "bk-102",
    kind: "class",
    title: "کلاس کراس‌فیت گروهی",
    clubName: "باشگاه آترین",
    coach: {
      name: "مربی امیر رضایی",
      verification: "verified",
      specialtyLabel: "کراس‌فیت",
      rating: 4.5,
      ratingCount: 587,
    },
    datetimeLabel: "یکشنبه ۱۹ مرداد، ۰۷:۳۰",
    dateLabel: "یکشنبه ۱۹ مرداد ۱۴۰۵",
    timeLabel: "۰۷:۳۰ تا ۰۸:۳۰",
    locationLabel: "تهران، ونک، سالن اصلی",
    priceLabel: "۲۲۰٬۰۰۰ تومان",
    status: "AWAITING_PAYMENT",
    invoiceId: "inv-1002",
  },
  {
    id: "bk-103",
    kind: "coach",
    title: "مشاوره برنامه تمرینی",
    clubName: "باشگاه انرژی",
    coach: {
      name: "مربی نیما کریمی",
      verification: "verified",
      specialtyLabel: "برنامه‌نویسی تمرین",
      rating: 4.6,
      ratingCount: 132,
    },
    datetimeLabel: "دوشنبه ۲۰ مرداد، ۱۶:۰۰",
    dateLabel: "دوشنبه ۲۰ مرداد ۱۴۰۵",
    timeLabel: "۱۶:۰۰ تا ۱۶:۴۵",
    locationLabel: "تهران، سعادت‌آباد، اتاق مشاوره",
    priceLabel: "۳۰۰٬۰۰۰ تومان",
    status: "PENDING",
    invoiceId: "inv-1003",
  },
  {
    id: "bk-104",
    kind: "class",
    title: "کلاس یوگا صبحگاهی",
    clubName: "باشگاه آرامش",
    coach: {
      name: "مربی مریم احمدی",
      verification: "verified",
      specialtyLabel: "یوگا",
      rating: 4.9,
      ratingCount: 318,
    },
    datetimeLabel: "امروز، ۰۹:۰۰",
    dateLabel: "امروز، ۱۶ مرداد ۱۴۰۵",
    timeLabel: "۰۹:۰۰ تا ۱۰:۰۰",
    locationLabel: "تهران، جردن، سالن یوگا",
    priceLabel: "۱۸۰٬۰۰۰ تومان",
    status: "CHECKED_IN",
    checkInCode: "۷۱۵۲۰۶",
    invoiceId: "inv-1004",
  },
  {
    id: "bk-105",
    kind: "space",
    title: "رزرو سالن اسکواش",
    clubName: "مجموعه المپیک",
    datetimeLabel: "چهارشنبه ۸ مرداد، ۲۰:۰۰",
    dateLabel: "چهارشنبه ۸ مرداد ۱۴۰۵",
    timeLabel: "۲۰:۰۰ تا ۲۱:۰۰",
    locationLabel: "تهران، آزادی، زمین ۳",
    priceLabel: "۳۵۰٬۰۰۰ تومان",
    status: "COMPLETED",
    invoiceId: "inv-1005",
  },
  {
    id: "bk-106",
    kind: "session",
    title: "جلسه تمرین فانکشنال",
    clubName: "باشگاه آترین",
    coach: {
      name: "مربی مریم احمدی",
      verification: "verified",
      specialtyLabel: "فانکشنال",
      rating: 4.7,
      ratingCount: 96,
    },
    datetimeLabel: "شنبه ۴ مرداد، ۱۷:۰۰",
    dateLabel: "شنبه ۴ مرداد ۱۴۰۵",
    timeLabel: "۱۷:۰۰ تا ۱۸:۰۰",
    locationLabel: "تهران، ونک، سالن ۱",
    priceLabel: "۴۰۰٬۰۰۰ تومان",
    status: "NO_SHOW",
    invoiceId: "inv-1006",
  },
  {
    id: "bk-107",
    kind: "class",
    title: "کلاس اسپینینگ",
    clubName: "باشگاه انرژی",
    coach: {
      name: "مربی سارا محمدی",
      verification: "unverified",
      specialtyLabel: "کاردیو",
      rating: 4.3,
      ratingCount: 74,
    },
    datetimeLabel: "سه‌شنبه ۳۱ تیر، ۱۹:۰۰",
    dateLabel: "سه‌شنبه ۳۱ تیر ۱۴۰۵",
    timeLabel: "۱۹:۰۰ تا ۲۰:۰۰",
    locationLabel: "تهران، سعادت‌آباد، سالن دوچرخه",
    priceLabel: "۲۵۰٬۰۰۰ تومان",
    status: "REFUNDED",
    invoiceId: "inv-1007",
  },
  {
    id: "bk-108",
    kind: "session",
    title: "جلسه شنا آموزشی",
    clubName: "مجموعه المپیک",
    coach: {
      name: "مربی حسین نادری",
      verification: "verified",
      specialtyLabel: "شنا",
      rating: 4.4,
      ratingCount: 151,
    },
    datetimeLabel: "پنجشنبه ۲۶ تیر، ۱۰:۰۰",
    dateLabel: "پنجشنبه ۲۶ تیر ۱۴۰۵",
    timeLabel: "۱۰:۰۰ تا ۱۱:۰۰",
    locationLabel: "تهران، آزادی، استخر اصلی",
    priceLabel: "۵۰۰٬۰۰۰ تومان",
    status: "CANCELLED",
    invoiceId: "inv-1008",
  },
];

export function getBooking(bookingId: string): AthleteBooking | undefined {
  return ATHLETE_BOOKINGS.find((booking) => booking.id === bookingId);
}

export function getAllBookingIds(): string[] {
  return ATHLETE_BOOKINGS.map((booking) => booking.id);
}

export function canManageBooking(status: BookingStatus): boolean {
  return (
    status === "PENDING" ||
    status === "AWAITING_PAYMENT" ||
    status === "CONFIRMED" ||
    status === "CHECKED_IN"
  );
}
