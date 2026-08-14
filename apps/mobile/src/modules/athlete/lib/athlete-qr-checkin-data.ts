export type QrCheckInEntry = {
  id: string;
  clubName: string;
  checkedInAtLabel: string;
  status: "success" | "expired" | "invalid";
};

export type QrCheckInState = {
  code: string;
  expiresAtLabel: string;
  recentCheckIns: QrCheckInEntry[];
};

export const DEFAULT_QR_CHECKIN: QrCheckInState = {
  code: "GYM4ME-7X2K-9P4M",
  expiresAtLabel: "تا ۱۵ دقیقه دیگر",
  recentCheckIns: [
    {
      id: "c1",
      clubName: "باشگاه آلفا",
      checkedInAtLabel: "امروز · ۱۷:۳۲",
      status: "success",
    },
    {
      id: "c2",
      clubName: "باشگاه آلفا",
      checkedInAtLabel: "دیروز · ۱۸:۱۰",
      status: "success",
    },
    {
      id: "c3",
      clubName: "باشگاه بتا",
      checkedInAtLabel: "۳ روز پیش · ۱۹:۰۰",
      status: "expired",
    },
  ],
};

export function refreshQrCode(): Pick<QrCheckInState, "code" | "expiresAtLabel"> {
  const segment = () =>
    Math.random().toString(36).slice(2, 6).toUpperCase();
  return {
    code: `GYM4ME-${segment()}-${segment()}`,
    expiresAtLabel: "تا ۱۵ دقیقه دیگر",
  };
}
