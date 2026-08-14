export type SubscriptionPlanTier = "free" | "pro" | "club";

export type SubscriptionPlan = {
  id: string;
  tier: SubscriptionPlanTier;
  name: string;
  priceLabel: string;
  periodLabel: string;
  features: string[];
};

export type AthleteSubscriptionState = {
  currentPlanId: string;
  plans: SubscriptionPlan[];
};

export const DEFAULT_ATHLETE_SUBSCRIPTION: AthleteSubscriptionState = {
  currentPlanId: "free",
  plans: [
    {
      id: "free",
      tier: "free",
      name: "رایگان",
      priceLabel: "۰",
      periodLabel: "همیشه",
      features: [
        "رزرو جلسات پایه",
        "پیگیری معیارهای شخصی",
        "فید اجتماعی",
      ],
    },
    {
      id: "pro",
      tier: "pro",
      name: "حرفه‌ای",
      priceLabel: "۱۹۹٬۰۰۰",
      periodLabel: "ماهانه",
      features: [
        "همه امکانات رایگان",
        "برنامه تمرینی شخصی‌سازی‌شده",
        "گفتگو با مربی",
        "گزارش پیشرفت پیشرفته",
      ],
    },
    {
      id: "club",
      tier: "club",
      name: "باشگاه",
      priceLabel: "۴۹۹٬۰۰۰",
      periodLabel: "ماهانه",
      features: [
        "همه امکانات حرفه‌ای",
        "عضویت چندباشگاهی",
        "اولویت رزرو",
        "پشتیبانی VIP",
      ],
    },
  ],
};
