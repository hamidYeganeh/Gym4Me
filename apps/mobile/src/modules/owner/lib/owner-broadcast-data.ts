export type OwnerBroadcastAudience = "all" | "active_members" | "at_risk";

export type OwnerBroadcastEntry = {
  id: string;
  title: string;
  body: string;
  audience: OwnerBroadcastAudience;
  sentAtLabel: string;
  recipientCount: number;
};

export const OWNER_BROADCASTS: OwnerBroadcastEntry[] = [
  {
    id: "bc-1",
    title: "تمدید عضویت با ۱۰٪ تخفیف",
    body: "تا پایان هفته عضویت خود را تمدید کنید و از تخفیف ویژه بهره‌مند شوید.",
    audience: "at_risk",
    sentAtLabel: "۱۴۰۳/۰۵/۲۰ · ۱۰:۳۰",
    recipientCount: 48,
  },
  {
    id: "bc-2",
    title: "تعطیلی موقت سالن",
    body: "سالن ونک روز جمعه ۲۵ مرداد برای تعمیرات تعطیل است.",
    audience: "active_members",
    sentAtLabel: "۱۴۰۳/۰۵/۱۸ · ۱۴:۰۰",
    recipientCount: 312,
  },
  {
    id: "bc-3",
    title: "افتتاح شعبه جدید",
    body: "شعبه سعادت‌آباد با تجهیزات جدید افتتاح شد.",
    audience: "all",
    sentAtLabel: "۱۴۰۳/۰۵/۰۱ · ۰۹:۰۰",
    recipientCount: 890,
  },
];
