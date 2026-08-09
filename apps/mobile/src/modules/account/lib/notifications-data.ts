import type { NotificationItem } from "@repo/api";

export type NotificationRoleSegment = "athlete" | "coach" | "owner";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const OWNER_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "owner-n1",
    templateKey: "booking.confirmed",
    title: "رزرو جدید تأیید شد",
    body: "علی محمدی کلاس کراس‌فیت ساعت ۱۸:۰۰ را رزرو کرد.",
    payload: { bookingId: "bk-owner-1" },
    readStatus: "unread",
    createdAt: hoursAgo(0.4),
  },
  {
    id: "owner-n2",
    templateKey: "payment.succeeded",
    title: "پرداخت عضویت دریافت شد",
    body: "مبلغ ۲٬۴۵۰٬۰۰۰ تومان برای عضویت ماهانه باشگاه آسمان واریز شد.",
    payload: { invoiceId: "inv-owner-1" },
    readStatus: "unread",
    createdAt: hoursAgo(1.5),
  },
  {
    id: "owner-n3",
    templateKey: "waitlist.offer",
    title: "لیست انتظار پر شد",
    body: "۳ نفر در لیست انتظار کلاس یوگا فردا صبح هستند.",
    payload: { classId: "cls-yoga-1" },
    readStatus: "unread",
    createdAt: hoursAgo(3),
  },
  {
    id: "owner-n4",
    templateKey: "booking.cancelled_by_provider",
    title: "لغو رزرو توسط عضو",
    body: "سارا احمدی رزرو باشگاه بدنسازی ساعت ۲۰ را لغو کرد.",
    payload: { bookingId: "bk-owner-2" },
    readStatus: "unread",
    createdAt: hoursAgo(5),
  },
  {
    id: "owner-n5",
    templateKey: "membership.expiring",
    title: "عضویت‌های در حال انقضا",
    body: "۱۲ عضویت تا ۷ روز دیگر منقضی می‌شود؛ برای تمدید پیگیری کنید.",
    payload: null,
    readStatus: "unread",
    createdAt: hoursAgo(8),
  },
  {
    id: "owner-n6",
    templateKey: "payout.settled",
    title: "تسویه مالی انجام شد",
    body: "مبلغ ۱۸٬۷۰۰٬۰۰۰ تومان به حساب باشگاه واریز شد.",
    payload: { payoutId: "po-1" },
    readStatus: "unread",
    createdAt: daysAgo(1),
  },
  {
    id: "owner-n7",
    templateKey: "booking.reminder",
    title: "یادآوری کلاس شلوغ",
    body: "کلاس HIIT فردا ۱۹:۰۰ ظرفیت کامل دارد؛ پرسنل را هماهنگ کنید.",
    payload: { classId: "cls-hiit-1" },
    readStatus: "unread",
    createdAt: daysAgo(2),
  },
  {
    id: "owner-n8",
    templateKey: "payment.failed",
    title: "پرداخت ناموفق",
    body: "پرداخت عضویت رضا کریمی ناموفق بود؛ عضو نیاز به پیگیری دارد.",
    payload: { invoiceId: "inv-owner-2" },
    readStatus: "unread",
    createdAt: daysAgo(3),
  },
  {
    id: "owner-n9",
    templateKey: "promo.campaign",
    title: "کمپین جذب عضو",
    body: "پیشنهاد ۲۰٪ تخفیف عضویت سالانه تا پایان هفته فعال است.",
    payload: null,
    readStatus: "unread",
    createdAt: daysAgo(4),
  },
  {
    id: "owner-n10",
    templateKey: "booking.confirmed",
    title: "رزرو فضای خصوصی",
    body: "رزرو سالن چندمنظوره برای شنبه ساعت ۱۰ تأیید شد.",
    payload: { bookingId: "bk-owner-3" },
    readStatus: "read",
    createdAt: daysAgo(10),
  },
  {
    id: "owner-n11",
    templateKey: "payment.succeeded",
    title: "گزارش درآمد هفتگی",
    body: "درآمد هفته گذشته نسبت به هفته قبل ۱۲٪ رشد داشته است.",
    payload: null,
    readStatus: "read",
    createdAt: daysAgo(12),
  },
];

const COACH_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "coach-n1",
    templateKey: "booking.confirmed",
    title: "جلسه جدید رزرو شد",
    body: "نیما حسینی جلسه خصوصی فردا ساعت ۱۷ را رزرو کرد.",
    payload: { bookingId: "bk-coach-1" },
    readStatus: "unread",
    createdAt: hoursAgo(0.7),
  },
  {
    id: "coach-n2",
    templateKey: "booking.reminder",
    title: "یادآوری جلسه امروز",
    body: "جلسه با مریم کاظمی ساعت ۲۰:۳۰ شروع می‌شود.",
    payload: { bookingId: "bk-coach-2" },
    readStatus: "unread",
    createdAt: hoursAgo(2),
  },
  {
    id: "coach-n3",
    templateKey: "payout.settled",
    title: "درآمد تسویه شد",
    body: "مبلغ ۴٬۲۰۰٬۰۰۰ تومان به کیف پول شما اضافه شد.",
    payload: { payoutId: "po-coach-1" },
    readStatus: "unread",
    createdAt: hoursAgo(6),
  },
  {
    id: "coach-n4",
    templateKey: "booking.cancelled_by_provider",
    title: "لغو جلسه توسط شاگرد",
    body: "امیر رضایی جلسه پنجشنبه را لغو کرد.",
    payload: { bookingId: "bk-coach-3" },
    readStatus: "unread",
    createdAt: daysAgo(1),
  },
  {
    id: "coach-n5",
    templateKey: "coach.verification_result",
    title: "پروفایل مربی به‌روز شد",
    body: "مدارک جدید شما بررسی و تأیید شد.",
    payload: null,
    readStatus: "read",
    createdAt: daysAgo(2),
  },
  {
    id: "coach-n6",
    templateKey: "promo.program",
    title: "برنامه تمرینی پیشنهادی",
    body: "۳ شاگرد برنامه قدرتی جدید شما را مشاهده کرده‌اند.",
    payload: null,
    readStatus: "read",
    createdAt: daysAgo(9),
  },
];

const ATHLETE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "athlete-n1",
    templateKey: "booking.reminder",
    title: "یادآوری کلاس",
    body: "کلاس کراس‌فیت امروز ساعت ۱۸:۰۰ در باشگاه آسمان شروع می‌شود.",
    payload: { bookingId: "bk-ath-1" },
    readStatus: "unread",
    createdAt: hoursAgo(0.5),
  },
  {
    id: "athlete-n2",
    templateKey: "payment.succeeded",
    title: "پرداخت موفق",
    body: "هزینه رزرو کلاس یوگا با موفقیت پرداخت شد.",
    payload: { invoiceId: "inv-ath-1" },
    readStatus: "unread",
    createdAt: hoursAgo(2),
  },
  {
    id: "athlete-n3",
    templateKey: "membership.expiring",
    title: "عضویت رو به پایان",
    body: "عضویت ماهانه شما ۵ روز دیگر منقضی می‌شود.",
    payload: null,
    readStatus: "unread",
    createdAt: hoursAgo(7),
  },
  {
    id: "athlete-n4",
    templateKey: "waitlist.offer",
    title: "جای خالی در کلاس",
    body: "یک صندلی در کلاس HIIT فردا آزاد شد؛ تا ۲ ساعت فرصت رزرو دارید.",
    payload: { classId: "cls-hiit-2" },
    readStatus: "unread",
    createdAt: daysAgo(1),
  },
  {
    id: "athlete-n5",
    templateKey: "booking.confirmed",
    title: "رزرو تأیید شد",
    body: "رزرو جلسه با مربی سارا محمدی برای شنبه ثبت شد.",
    payload: { bookingId: "bk-ath-2" },
    readStatus: "read",
    createdAt: daysAgo(2),
  },
  {
    id: "athlete-n6",
    templateKey: "promo.offer",
    title: "تخفیف ویژه باشگاه",
    body: "۱۵٪ تخفیف روی تمدید عضویت سه‌ماهه تا پایان هفته.",
    payload: null,
    readStatus: "read",
    createdAt: daysAgo(8),
  },
  {
    id: "athlete-n7",
    templateKey: "payment.failed",
    title: "پرداخت ناموفق",
    body: "پرداخت فاکتور کیف پول انجام نشد؛ دوباره تلاش کنید.",
    payload: { invoiceId: "inv-ath-2" },
    readStatus: "read",
    createdAt: daysAgo(11),
  },
];

const BY_ROLE: Record<NotificationRoleSegment, NotificationItem[]> = {
  owner: OWNER_NOTIFICATIONS,
  coach: COACH_NOTIFICATIONS,
  athlete: ATHLETE_NOTIFICATIONS,
};

/** Demo inbox items when the API is empty or unreachable. */
export function getMockNotifications(
  role: NotificationRoleSegment = "athlete",
): NotificationItem[] {
  return BY_ROLE[role];
}

export function getMockNotificationInbox(role: NotificationRoleSegment = "athlete") {
  const items = getMockNotifications(role);
  return {
    items,
    meta: {
      page: 1,
      limit: items.length,
      total: items.length,
      unreadCount: items.filter((item) => item.readStatus === "unread").length,
    },
  };
}
