import {
  NotificationChannelSetting,
  NotificationSmsSetting,
  NotificationTemplateKey,
} from '../common/enums';

export interface DefaultNotificationTemplate {
  key: NotificationTemplateKey;
  title: string;
  body: string;
  channels: {
    push: NotificationChannelSetting;
    sms: NotificationSmsSetting;
    inbox: NotificationChannelSetting;
  };
  smsTemplateKey?: string;
}

const push = NotificationChannelSetting.ENABLED;
const inbox = NotificationChannelSetting.ENABLED;

/**
 * Transactional defaults seeded at boot (upsert-on-missing; admin edits win).
 * Critical templates use SMS as fallback when push delivery fails (N1/N2).
 */
export const DEFAULT_NOTIFICATION_TEMPLATES: DefaultNotificationTemplate[] = [
  {
    key: NotificationTemplateKey.PAYMENT_SUCCEEDED,
    title: 'پرداخت موفق',
    body: 'پرداخت {amount} تومانی شما برای {subject} با موفقیت انجام شد. کد پیگیری: {refId}',
    channels: { push, inbox, sms: NotificationSmsSetting.DISABLED },
  },
  {
    key: NotificationTemplateKey.PAYMENT_FAILED,
    title: 'پرداخت ناموفق',
    body: 'پرداخت شما برای {subject} انجام نشد. در صورت کسر مبلغ، طی ۷۲ ساعت بازگردانده می‌شود.',
    channels: { push, inbox, sms: NotificationSmsSetting.CRITICAL_FALLBACK },
  },
  {
    key: NotificationTemplateKey.BOOKING_CONFIRMED,
    title: 'رزرو تأیید شد',
    body: 'رزرو شما در {clubName} برای {date} ساعت {time} تأیید شد.',
    channels: { push, inbox, sms: NotificationSmsSetting.CRITICAL_FALLBACK },
  },
  {
    key: NotificationTemplateKey.BOOKING_APPROVED_PAYMENT_REQUIRED,
    title: 'درخواست رزرو تأیید شد',
    body: 'مربی درخواست شما را تأیید کرد. برای حفظ نوبت تا {deadline} پرداخت را انجام دهید.',
    channels: { push, inbox, sms: NotificationSmsSetting.ALWAYS },
  },
  {
    key: NotificationTemplateKey.BOOKING_REJECTED,
    title: 'رزرو رد شد',
    body: 'رزرو شما برای {subject} تأیید نشد. مبلغ پرداختی طبق سیاست لغو بازگردانده می‌شود.',
    channels: { push, inbox, sms: NotificationSmsSetting.CRITICAL_FALLBACK },
  },
  {
    key: NotificationTemplateKey.BOOKING_REMINDER,
    title: 'یادآوری جلسه',
    body: 'یادآوری: {subject} امروز ساعت {time} در {clubName} برگزار می‌شود.',
    channels: { push, inbox, sms: NotificationSmsSetting.DISABLED },
  },
  {
    key: NotificationTemplateKey.BOOKING_CANCELLED_BY_PROVIDER,
    title: 'لغو از سمت مجموعه',
    body: '{subject} در {date} توسط مجموعه لغو شد. برای جابه‌جایی یا بازپرداخت اقدام کنید.',
    channels: { push, inbox, sms: NotificationSmsSetting.ALWAYS },
  },
  {
    key: NotificationTemplateKey.BOOKING_RESCHEDULED,
    title: 'زمان رزرو تغییر کرد',
    body: 'رزرو {subject} به {date} ساعت {time} منتقل شد.',
    channels: { push, inbox, sms: NotificationSmsSetting.ALWAYS },
  },
  {
    key: NotificationTemplateKey.WAITLIST_OFFER,
    title: 'ظرفیت آزاد شد',
    body: 'ظرفیت {subject} آزاد شد! تا {deadline} فرصت دارید رزرو را نهایی کنید.',
    channels: { push, inbox, sms: NotificationSmsSetting.ALWAYS },
  },
  {
    key: NotificationTemplateKey.MEMBERSHIP_EXPIRING,
    title: 'عضویت رو به پایان',
    body: 'عضویت شما در {clubName} تا {daysLeft} روز دیگر به پایان می‌رسد. برای تمدید اقدام کنید.',
    channels: { push, inbox, sms: NotificationSmsSetting.DISABLED },
  },
  {
    key: NotificationTemplateKey.LIFECYCLE_LOW_CREDITS,
    title: 'جلسات رو به اتمام',
    body: 'تنها {remaining} جلسه از عضویت شما در {clubName} باقی مانده است. برای شارژ مجدد اقدام کنید.',
    channels: { push, inbox, sms: NotificationSmsSetting.DISABLED },
  },
  {
    key: NotificationTemplateKey.LIFECYCLE_WIN_BACK,
    title: 'دلمان برایتان تنگ شده!',
    body: 'مدتی است به {clubName} سر نزده‌اید. برنامه‌های جدید منتظر شماست — همین امروز برگردید.',
    channels: { push, inbox, sms: NotificationSmsSetting.DISABLED },
  },
  {
    key: NotificationTemplateKey.COACH_VERIFICATION_RESULT,
    title: 'نتیجه بررسی مدارک مربیگری',
    body: 'وضعیت درخواست تأیید مربیگری شما: {result}',
    channels: { push, inbox, sms: NotificationSmsSetting.CRITICAL_FALLBACK },
  },
  {
    key: NotificationTemplateKey.ROLE_REQUEST_RESULT,
    title: 'نتیجه درخواست نقش',
    body: 'درخواست نقش «{roleLabel}» شما: {result}',
    channels: { push, inbox, sms: NotificationSmsSetting.CRITICAL_FALLBACK },
  },
  {
    key: NotificationTemplateKey.PAYOUT_SETTLED,
    title: 'تسویه انجام شد',
    body: 'تسویه دوره {period} به مبلغ {amount} تومان انجام شد.',
    channels: { push, inbox, sms: NotificationSmsSetting.DISABLED },
  },
  {
    key: NotificationTemplateKey.ACHIEVEMENT_UNLOCKED,
    title: 'نشان جدید باز شد!',
    body: 'تبریک! نشان «{achievementTitle}» را دریافت کردید{bonusSuffix}.',
    channels: { push, inbox, sms: NotificationSmsSetting.DISABLED },
  },
];
