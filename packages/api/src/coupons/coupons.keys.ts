export const ownerCouponKeys = {
  all: ["owner-coupons"] as const,
  list: (clubId: string, query: Record<string, unknown> = {}) =>
    [...ownerCouponKeys.all, clubId, query] as const,
} as const;
