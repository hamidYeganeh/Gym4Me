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
    key: NotificationTemplateKey.COACH_VERIFICATION_RESULT,
    title: 'نتیجه بررسی مدارک مربیگری',
    body: 'وضعیت درخواست تأیید مربیگری شما: {result}',
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
