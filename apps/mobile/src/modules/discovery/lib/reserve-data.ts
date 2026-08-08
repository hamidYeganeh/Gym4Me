export type ReserveSlotState = "available" | "low" | "full";

export type ReserveDay = {
  id: string;
  weekdayLabel: string;
  dayLabel: string;
};

export type ReserveSlot = {
  id: string;
  timeLabel: string;
  capacityLabel: string;
  state: ReserveSlotState;
};

export type ReservePlan = {
  id: string;
  title: string;
  priceLabel: string;
  description: string;
};

export const RESERVE_DAYS: ReserveDay[] = [
  { id: "day-1", weekdayLabel: "شنبه", dayLabel: "۱۸ مرداد" },
  { id: "day-2", weekdayLabel: "یکشنبه", dayLabel: "۱۹ مرداد" },
  { id: "day-3", weekdayLabel: "دوشنبه", dayLabel: "۲۰ مرداد" },
  { id: "day-4", weekdayLabel: "سه‌شنبه", dayLabel: "۲۱ مرداد" },
  { id: "day-5", weekdayLabel: "چهارشنبه", dayLabel: "۲۲ مرداد" },
  { id: "day-6", weekdayLabel: "پنجشنبه", dayLabel: "۲۳ مرداد" },
  { id: "day-7", weekdayLabel: "جمعه", dayLabel: "۲۴ مرداد" },
];

export const RESERVE_SLOTS_BY_DAY: Record<string, ReserveSlot[]> = {
  "day-1": [
    { id: "d1-s1", timeLabel: "۰۷:۰۰ تا ۰۸:۳۰", capacityLabel: "۸ جای خالی", state: "available" },
    { id: "d1-s2", timeLabel: "۰۹:۰۰ تا ۱۰:۳۰", capacityLabel: "۲ جای خالی", state: "low" },
    { id: "d1-s3", timeLabel: "۱۱:۰۰ تا ۱۲:۳۰", capacityLabel: "تکمیل", state: "full" },
    { id: "d1-s4", timeLabel: "۱۶:۰۰ تا ۱۷:۳۰", capacityLabel: "۵ جای خالی", state: "available" },
    { id: "d1-s5", timeLabel: "۱۸:۰۰ تا ۱۹:۳۰", capacityLabel: "۱ جای خالی", state: "low" },
    { id: "d1-s6", timeLabel: "۲۰:۰۰ تا ۲۱:۳۰", capacityLabel: "۶ جای خالی", state: "available" },
  ],
  "day-2": [
    { id: "d2-s1", timeLabel: "۰۷:۰۰ تا ۰۸:۳۰", capacityLabel: "۴ جای خالی", state: "available" },
    { id: "d2-s2", timeLabel: "۰۹:۰۰ تا ۱۰:۳۰", capacityLabel: "تکمیل", state: "full" },
    { id: "d2-s3", timeLabel: "۱۶:۰۰ تا ۱۷:۳۰", capacityLabel: "۳ جای خالی", state: "available" },
    { id: "d2-s4", timeLabel: "۱۸:۰۰ تا ۱۹:۳۰", capacityLabel: "۲ جای خالی", state: "low" },
  ],
  "day-3": [
    { id: "d3-s1", timeLabel: "۰۸:۰۰ تا ۰۹:۳۰", capacityLabel: "۷ جای خالی", state: "available" },
    { id: "d3-s2", timeLabel: "۱۰:۰۰ تا ۱۱:۳۰", capacityLabel: "۵ جای خالی", state: "available" },
    { id: "d3-s3", timeLabel: "۱۷:۰۰ تا ۱۸:۳۰", capacityLabel: "تکمیل", state: "full" },
    { id: "d3-s4", timeLabel: "۱۹:۰۰ تا ۲۰:۳۰", capacityLabel: "۱ جای خالی", state: "low" },
  ],
  "day-4": [
    { id: "d4-s1", timeLabel: "۰۷:۰۰ تا ۰۸:۳۰", capacityLabel: "۶ جای خالی", state: "available" },
    { id: "d4-s2", timeLabel: "۱۶:۰۰ تا ۱۷:۳۰", capacityLabel: "۴ جای خالی", state: "available" },
    { id: "d4-s3", timeLabel: "۱۸:۰۰ تا ۱۹:۳۰", capacityLabel: "تکمیل", state: "full" },
    { id: "d4-s4", timeLabel: "۲۰:۰۰ تا ۲۱:۳۰", capacityLabel: "۸ جای خالی", state: "available" },
  ],
  "day-5": [
    { id: "d5-s1", timeLabel: "۰۹:۰۰ تا ۱۰:۳۰", capacityLabel: "۳ جای خالی", state: "available" },
    { id: "d5-s2", timeLabel: "۱۱:۰۰ تا ۱۲:۳۰", capacityLabel: "۲ جای خالی", state: "low" },
    { id: "d5-s3", timeLabel: "۱۷:۰۰ تا ۱۸:۳۰", capacityLabel: "۵ جای خالی", state: "available" },
  ],
  "day-6": [
    { id: "d6-s1", timeLabel: "۰۸:۰۰ تا ۰۹:۳۰", capacityLabel: "تکمیل", state: "full" },
    { id: "d6-s2", timeLabel: "۱۰:۰۰ تا ۱۱:۳۰", capacityLabel: "تکمیل", state: "full" },
    { id: "d6-s3", timeLabel: "۱۶:۰۰ تا ۱۷:۳۰", capacityLabel: "۱ جای خالی", state: "low" },
  ],
  "day-7": [],
};

export const RESERVE_PLANS: ReservePlan[] = [
  {
    id: "plan-single",
    title: "تک‌جلسه",
    priceLabel: "۴۵۰٬۰۰۰ تومان",
    description: "یک جلسه استفاده از سانس انتخابی بدون تعهد بلندمدت.",
  },
  {
    id: "plan-8",
    title: "بسته ۸ جلسه‌ای",
    priceLabel: "۳٬۲۰۰٬۰۰۰ تومان",
    description: "هشت جلسه در یک ماه با ۱۰٪ تخفیف نسبت به تک‌جلسه.",
  },
  {
    id: "plan-12",
    title: "بسته ۱۲ جلسه‌ای",
    priceLabel: "۴٬۵۰۰٬۰۰۰ تومان",
    description: "دوازده جلسه در یک ماه؛ مناسب تمرین منظم سه روز در هفته.",
  },
];
