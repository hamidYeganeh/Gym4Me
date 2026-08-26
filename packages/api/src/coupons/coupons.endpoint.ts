export const ownerCouponEndpoints = {
  list: (clubId: string) => `/account/clubs/${clubId}/coupons`,
  item: (clubId: string, couponId: string) =>
    `/account/clubs/${clubId}/coupons/${couponId}`,
} as const;
