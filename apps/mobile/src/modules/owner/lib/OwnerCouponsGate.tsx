"use client";

import { useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { OwnerCouponsScreen } from "../screens/OwnerCouponsScreen";
import type { OwnerCouponForm } from "../screens/OwnerCouponsScreen/OwnerCouponsScreen.types";
import { OWNER_COUPONS, type OwnerCoupon } from "./owner-coupons-data";

export function OwnerCouponsGate() {
  const [coupons, setCoupons] = useState(DEMO_MODE ? OWNER_COUPONS : []);
  const [form, setForm] = useState<OwnerCouponForm>({
    code: "",
    percentOff: "",
    maxRedemptions: "",
  });
  const [pending, setPending] = useState(false);

  const handleCreate = () => {
    setPending(true);
    setTimeout(() => {
      const next: OwnerCoupon = {
        id: `cp-${Date.now()}`,
        code: form.code.trim().toUpperCase(),
        percentOff: Number(form.percentOff) || 0,
        maxRedemptions: Number(form.maxRedemptions) || 0,
        usedCount: 0,
        status: "draft",
      };
      setCoupons((previous) => [next, ...previous]);
      setForm({ code: "", percentOff: "", maxRedemptions: "" });
      setPending(false);
    }, 400);
  };

  return (
    <OwnerCouponsScreen
      coupons={coupons}
      form={form}
      onCreate={DEMO_MODE ? handleCreate : undefined}
      onFormChange={(patch) =>
        setForm((previous) => ({ ...previous, ...patch }))
      }
      pending={pending}
    />
  );
}
