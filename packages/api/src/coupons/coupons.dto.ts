export type CouponStatus = "active" | "inactive" | "archived";
export type CouponDiscountType = "percent" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  title: string | null;
  clubId: string | null;
  discount: {
    type: CouponDiscountType;
    value: number;
    maxAmount: number | null;
  };
  constraints: {
    validFrom: string | null;
    validUntil: string | null;
    maxRedemptions: number | null;
    maxPerUser: number | null;
    minAmount: number | null;
  };
  status: CouponStatus;
  redemptionCount: number;
  createdAt: string;
};

export type CouponsList = { items: Coupon[] };
export type ListCouponsQuery = {
  status?: CouponStatus[];
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
export type CreateCouponInput = {
  code: string;
  title?: string;
  discount: { type: CouponDiscountType; value: number; maxAmount?: number };
  constraints?: {
    validFrom?: string;
    validUntil?: string;
    maxRedemptions?: number;
    maxPerUser?: number;
    minAmount?: number;
  };
  status?: CouponStatus;
};
export type UpdateCouponInput = Partial<
  Pick<CreateCouponInput, "title" | "discount" | "constraints" | "status">
>;
