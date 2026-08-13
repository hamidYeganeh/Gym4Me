import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

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

/** Live coach actions on an API-backed booking. */
export type CoachBookingAction =
  "accept" | "checkIn" | "complete" | "noShow" | "cancel";

export type CoachBookingRequest = {
  id: string;
  clientName: string;
  avatar: string;
  typeLabel: string;
  dateLabel: string;
  timeLabel: string;
  priceLabel: string;
  status: BookingStatus;
  checkInCode?: string;
  /** Present when the booking is backed by the live API. */
  api?: { actions: CoachBookingAction[] };
};

export const COACH_BOOKING_REQUESTS: CoachBookingRequest[] = [
  {
    id: "b1",
    clientName: "نگار احمدی",
    avatar: PLACEHOLDER_IMAGE,
    typeLabel: "جلسه خصوصی",
    dateLabel: "شنبه ۲۵ مرداد",
    timeLabel: "۱۷:۰۰ تا ۱۸:۰۰",
    priceLabel: "۴۵۰٬۰۰۰ تومان",
    status: "PENDING",
  },
  {
    id: "b2",
    clientName: "حسین موسوی",
    avatar: PLACEHOLDER_IMAGE,
    typeLabel: "جلسه خصوصی",
    dateLabel: "یکشنبه ۲۶ مرداد",
    timeLabel: "۰۸:۰۰ تا ۰۹:۰۰",
    priceLabel: "۴۵۰٬۰۰۰ تومان",
    status: "PENDING",
  },
  {
    id: "b3",
    clientName: "مریم کریمی",
    avatar: PLACEHOLDER_IMAGE,
    typeLabel: "کلاس",
    dateLabel: "دوشنبه ۲۷ مرداد",
    timeLabel: "۱۸:۳۰ تا ۱۹:۳۰",
    priceLabel: "۲۲۰٬۰۰۰ تومان",
    status: "PENDING",
  },
  {
    id: "b4",
    clientName: "علی رضایی",
    avatar: PLACEHOLDER_IMAGE,
    typeLabel: "جلسه خصوصی",
    dateLabel: "سه‌شنبه ۲۸ مرداد",
    timeLabel: "۰۷:۰۰ تا ۰۸:۰۰",
    priceLabel: "۴۵۰٬۰۰۰ تومان",
    status: "CONFIRMED",
    checkInCode: "۸۲۴۱",
  },
  {
    id: "b5",
    clientName: "الهام شریفی",
    avatar: PLACEHOLDER_IMAGE,
    typeLabel: "کلاس",
    dateLabel: "چهارشنبه ۲۹ مرداد",
    timeLabel: "۱۰:۰۰ تا ۱۱:۰۰",
    priceLabel: "۲۲۰٬۰۰۰ تومان",
    status: "CONFIRMED",
    checkInCode: "۵۹۷۳",
  },
  {
    id: "b6",
    clientName: "رضا قاسمی",
    avatar: PLACEHOLDER_IMAGE,
    typeLabel: "جلسه خصوصی",
    dateLabel: "چهارشنبه ۲۱ مرداد",
    timeLabel: "۱۹:۰۰ تا ۲۰:۰۰",
    priceLabel: "۴۵۰٬۰۰۰ تومان",
    status: "COMPLETED",
  },
  {
    id: "b7",
    clientName: "سمیرا نادری",
    avatar: PLACEHOLDER_IMAGE,
    typeLabel: "کلاس",
    dateLabel: "دوشنبه ۱۹ مرداد",
    timeLabel: "۱۰:۰۰ تا ۱۱:۰۰",
    priceLabel: "۲۲۰٬۰۰۰ تومان",
    status: "NO_SHOW",
  },
  {
    id: "b8",
    clientName: "نگار احمدی",
    avatar: PLACEHOLDER_IMAGE,
    typeLabel: "جلسه خصوصی",
    dateLabel: "شنبه ۱۷ مرداد",
    timeLabel: "۱۷:۰۰ تا ۱۸:۰۰",
    priceLabel: "۴۵۰٬۰۰۰ تومان",
    status: "CANCELLED",
  },
];
