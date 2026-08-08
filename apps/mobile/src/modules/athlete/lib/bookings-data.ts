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

export type AthleteBooking = {
  id: string;
  kind: BookingKind;
  title: string;
  clubName: string;
  coachName?: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  priceLabel: string;
  status: BookingStatus;
  checkInCode?: string;
  invoiceId?: string;
};

export const ATHLETE_BOOKINGS: AthleteBooking[] = [
  {
    id: "bk-101",
    kind: "session",
    title: "جلسه بدنسازی اختصاصی",
    clubName: "باشگاه انرژی",
    coachName: "سارا محمدی",
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
    coachName: "امیر رضایی",
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
    coachName: "نیما کریمی",
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
    coachName: "مریم احمدی",
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
    coachName: "حسین نادری",
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
