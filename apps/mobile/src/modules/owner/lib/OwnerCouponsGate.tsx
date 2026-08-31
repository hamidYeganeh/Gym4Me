"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type Coupon } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { faDigits } from "@/shared/lib/booking-view";
import { accountClubs, ownerCoupons } from "@/shared/lib/api";
import { isoToJalaliDisplay } from "@/shared/lib/jalali";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerCouponsScreen } from "../screens/OwnerCouponsScreen";
import type { OwnerCouponForm } from "../screens/OwnerCouponsScreen/OwnerCouponsScreen.types";
import { OWNER_COUPONS, type OwnerCoupon } from "./owner-coupons-data";

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function mapCoupon(coupon: Coupon): OwnerCoupon {
  const expired =
    coupon.constraints.validUntil !== null &&
    new Date(coupon.constraints.validUntil).getTime() < Date.now();
  const status: OwnerCoupon["status"] = expired
    ? "expired"
    : coupon.status === "active"
      ? "active"
      : coupon.status === "inactive"
        ? "draft"
        : "disabled";
  return {
    id: coupon.id,
    code: coupon.code,
    percentOff:
      coupon.discount.type === "percent" ? coupon.discount.value : 0,
    maxRedemptions: coupon.constraints.maxRedemptions ?? 0,
    usedCount: coupon.redemptionCount,
    status,
    apiStatus: coupon.status,
    expiresAtLabel: coupon.constraints.validUntil
      ? faDigits(isoToJalaliDisplay(coupon.constraints.validUntil))
      : undefined,
  };
}

export function OwnerCouponsGate() {
  const t = useTranslations("OwnerCoupons");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<OwnerCoupon[] | null>(
    DEMO_MODE ? OWNER_COUPONS : null,
  );
  const [form, setForm] = useState<OwnerCouponForm>({
    code: "",
    percentOff: "",
    maxRedemptions: "",
  });
  const [pending, setPending] = useState(false);
  const [pendingCouponId, setPendingCouponId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const clubs = await accountClubs.list({ page_size: 1 });
    const selectedClubId = clubs.result[0]?.id;
    if (!selectedClubId) {
      setClubId(null);
      setCoupons([]);
      return;
    }
    const result = await ownerCoupons.list(selectedClubId, {
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setClubId(selectedClubId);
    setCoupons(result.items.map(mapCoupon));
  }, []);

  useEffect(() => {
    if (!isReady || DEMO_MODE) return;
    if (!isAuthenticated || activeRole !== "club_owner") {
      setCoupons([]);
      setError(t("unauthorized"));
      return;
    }
    void load().catch((cause: unknown) => {
      setCoupons([]);
      setError(cause instanceof ApiError ? cause.message : t("loadError"));
    });
  }, [activeRole, isAuthenticated, isReady, load, t]);

  const handleCreate = async () => {
    if (!clubId) return;
    const percentOff = Number(normalizeDigits(form.percentOff));
    const maxRedemptions = Number(normalizeDigits(form.maxRedemptions));
    if (
      !Number.isInteger(percentOff) ||
      percentOff < 1 ||
      percentOff > 100 ||
      !Number.isInteger(maxRedemptions) ||
      maxRedemptions < 1
    ) {
      setError(t("invalidForm"));
      return;
    }
    setPending(true);
    setError(null);
    try {
      await ownerCoupons.create(clubId, {
        code: form.code.trim().toUpperCase(),
        discount: { type: "percent", value: percentOff },
        constraints: { maxRedemptions, maxPerUser: 1 },
        status: "active",
      });
      setForm({ code: "", percentOff: "", maxRedemptions: "" });
      await load();
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : t("createError"));
    } finally {
      setPending(false);
    }
  };

  const toggleStatus = useCallback(
    async (coupon: OwnerCoupon) => {
      if (!clubId) return;
      setPendingCouponId(coupon.id);
      setError(null);
      try {
        await ownerCoupons.update(clubId, coupon.id, {
          status: coupon.apiStatus === "active" ? "inactive" : "active",
        });
        await load();
      } catch (cause: unknown) {
        setError(
          cause instanceof ApiError ? cause.message : t("updateError"),
        );
      } finally {
        setPendingCouponId(null);
      }
    },
    [clubId, load, t],
  );

  if (!coupons) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner aria-label={t("loading")} size="lg" />
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="flex flex-col items-center gap-2 px-4 pt-3" role="alert">
          <Typography className="text-danger" type="body-sm">
            {error}
          </Typography>
          {clubId ? (
            <Button onPress={() => void load()} size="lg" variant="secondary">
              {t("retry")}
            </Button>
          ) : null}
        </div>
      ) : null}
      <OwnerCouponsScreen
        coupons={coupons}
        form={form}
        onCreate={clubId ? () => void handleCreate() : undefined}
        onFormChange={(patch) =>
          setForm((previous) => ({ ...previous, ...patch }))
        }
        onToggleStatus={clubId ? (coupon) => void toggleStatus(coupon) : undefined}
        pending={pending}
        pendingCouponId={pendingCouponId}
      />
    </>
  );
}
