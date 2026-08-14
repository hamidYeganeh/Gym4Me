export type OwnerCouponStatus = "draft" | "active" | "expired" | "disabled";

export type OwnerCoupon = {
  id: string;
  code: string;
  percentOff: number;
  maxRedemptions: number;
  usedCount: number;
  status: OwnerCouponStatus;
  expiresAtLabel?: string;
};

export const OWNER_COUPONS: OwnerCoupon[] = [
  {
    id: "cp-1",
    code: "NOWRUZ1403",
    percentOff: 15,
    maxRedemptions: 100,
    usedCount: 42,
    status: "active",
    expiresAtLabel: "۱۴۰۳/۱۲/۲۹",
  },
  {
    id: "cp-2",
    code: "VIP-TEHRAN",
    percentOff: 20,
    maxRedemptions: 50,
    usedCount: 50,
    status: "expired",
    expiresAtLabel: "۱۴۰۳/۰۴/۳۱",
  },
  {
    id: "cp-3",
    code: "SUMMER-DRAFT",
    percentOff: 10,
    maxRedemptions: 200,
    usedCount: 0,
    status: "draft",
  },
  {
    id: "cp-4",
    code: "OLD-PROMO",
    percentOff: 25,
    maxRedemptions: 30,
    usedCount: 12,
    status: "disabled",
  },
];
