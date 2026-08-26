import type { OwnerCoupon } from "../../lib/owner-coupons-data";

export type OwnerCouponForm = {
  code: string;
  percentOff: string;
  maxRedemptions: string;
};

export type OwnerCouponsScreenProps = {
  coupons: OwnerCoupon[];
  form: OwnerCouponForm;
  pending?: boolean;
  onFormChange: (patch: Partial<OwnerCouponForm>) => void;
  onCreate?: () => void;
  onToggleStatus?: (coupon: OwnerCoupon) => void;
  pendingCouponId?: string | null;
  className?: string;
};
