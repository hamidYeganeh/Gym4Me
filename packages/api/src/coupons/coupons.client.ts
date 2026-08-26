import type { ApiClient } from "../client";
import type {
  Coupon,
  CouponsList,
  CreateCouponInput,
  ListCouponsQuery,
  UpdateCouponInput,
} from "./coupons.dto";
import { ownerCouponEndpoints as ep } from "./coupons.endpoint";

export function createOwnerCouponsApi(client: ApiClient) {
  return {
    list(clubId: string, query: ListCouponsQuery = {}) {
      return client.request<CouponsList>(ep.list(clubId), { query });
    },
    create(clubId: string, input: CreateCouponInput) {
      return client.request<Coupon>(ep.list(clubId), {
        method: "POST",
        body: input,
      });
    },
    update(clubId: string, couponId: string, input: UpdateCouponInput) {
      return client.request<Coupon>(ep.item(clubId, couponId), {
        method: "PATCH",
        body: input,
      });
    },
  };
}

export type OwnerCouponsApi = ReturnType<typeof createOwnerCouponsApi>;
