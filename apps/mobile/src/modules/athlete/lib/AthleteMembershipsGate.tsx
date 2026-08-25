"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type MembershipCheckoutPreview } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { accountMemberships } from "@/shared/lib/api";
import { useRouter } from "@/shared/lib/app-router";
import { useAuth } from "@/shared/providers/AuthProvider";
import { getPaymentCallbackUrl } from "@/shared/lib/payment-return";
import { AthleteMembershipsScreen } from "../screens/AthleteMembershipsScreen";
import { mapApiMembershipToAthlete } from "./api-memberships";
import type { AthleteMembership } from "./memberships-data";

/**
 * Client gate: live memberships for signed-in athletes.
 */
export function AthleteMembershipsGate() {
  const t = useTranslations("AthleteMemberships");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isReady } = useAuth();
  const [memberships, setMemberships] = useState<AthleteMembership[] | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await accountMemberships.listMine({ page_size: 100 });
    setMemberships(result.result.map(mapApiMembershipToAthlete));
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setMemberships([]);
      return;
    }
    let cancelled = false;
    const bootstrap = async () => {
      const checkoutId = searchParams.get("checkoutId");
      const authority = searchParams.get("Authority");
      const status = searchParams.get("Status");
      if (
        checkoutId &&
        authority &&
        (status === "OK" || status === "NOK")
      ) {
        setPending(true);
        await accountMemberships.verifyCheckout(checkoutId, {
          authority,
          status,
        });
        if (cancelled) return;
        router.replace("/athlete/memberships");
      }
      await reload();
    };
    bootstrap()
      .catch((error: unknown) => {
        if (cancelled) return;
        setActionError(
          error instanceof ApiError ? error.message : t("renewError"),
        );
        setMemberships([]);
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload, router, searchParams, t]);

  const previewRenewal = useCallback(async (membership: AthleteMembership) => {
    if (!membership.clubId || !membership.planId) {
      throw new Error("Membership cannot be renewed");
    }
    return accountMemberships.previewCheckout({
      clubId: membership.clubId,
      planId: membership.planId,
      membershipId: membership.id,
    });
  }, []);

  const confirmRenewal = useCallback(
    async (
      membership: AthleteMembership,
      preview: MembershipCheckoutPreview,
      idempotencyKey: string,
    ) => {
      if (!membership.clubId || !membership.planId) return;
      setPending(true);
      setActionError(null);
      try {
        const initiation = await accountMemberships.initiateCheckout({
          clubId: membership.clubId,
          planId: membership.planId,
          membershipId: membership.id,
          idempotencyKey,
          previewFingerprint: preview.fingerprint,
          consentVersion: preview.consentVersion,
          consentAccepted: true,
          callbackUrl: getPaymentCallbackUrl("/athlete/memberships"),
        });
        window.location.assign(initiation.redirectUrl);
      } catch (error) {
        setActionError(
          error instanceof ApiError ? error.message : t("renewError"),
        );
        throw error;
      } finally {
        setPending(false);
      }
    },
    [t],
  );

  if (!memberships) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {actionError ? (
        <div className="px-4 pt-2 text-center">
          <Typography className="text-danger" type="body-sm">
            {actionError}
          </Typography>
        </div>
      ) : null}
      <AthleteMembershipsScreen
        memberships={memberships}
        onConfirmRenewal={confirmRenewal}
        onPreviewRenewal={previewRenewal}
        pending={pending}
      />
    </>
  );
}
