export type PassKind = "trial" | "guest_pass" | "gift";

export type PassStatus = "available" | "used" | "expired";

export type AthletePass = {
  id: string;
  kind: PassKind;
  title: string;
  clubName?: string;
  expiresAtLabel: string;
  status: PassStatus;
};

export type PassOffer = {
  id: string;
  kind: PassKind;
  title: string;
  description: string;
  priceLabel?: string;
};

export type AthletePassesState = {
  owned: AthletePass[];
  offers: PassOffer[];
};

export const DEFAULT_ATHLETE_PASSES: AthletePassesState = {
  owned: [
    {
      id: "pass1",
      kind: "trial",
      title: "دوره آزمایشی ۷ روزه",
      clubName: "باشگاه آلفا",
      expiresAtLabel: "۱۴۰۴/۰۵/۲۵",
      status: "available",
    },
    {
      id: "pass2",
      kind: "guest_pass",
      title: "مهمان — ۱ جلسه",
      clubName: "باشگاه بتا",
      expiresAtLabel: "۱۴۰۴/۰۵/۱۸",
      status: "used",
    },
    {
      id: "pass3",
      kind: "gift",
      title: "هدیه تولد",
      expiresAtLabel: "۱۴۰۴/۰۴/۳۰",
      status: "expired",
    },
  ],
  offers: [
    {
      id: "offer1",
      kind: "trial",
      title: "۷ روز رایگان",
      description: "اولین عضویت در باشگاه آلفا",
      priceLabel: "رایگان",
    },
    {
      id: "offer2",
      kind: "guest_pass",
      title: "مهمان — ۱ جلسه",
      description: "یک جلسه آزمایشی برای دوستان",
      priceLabel: "۴۹٬۰۰۰ تومان",
    },
    {
      id: "offer3",
      kind: "gift",
      title: "کارت هدیه",
      description: "هدیه دادن اعتبار باشگاه به دوستان",
      priceLabel: "از ۲۰۰٬۰۰۰ تومان",
    },
  ],
};
