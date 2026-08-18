"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { useCallback, useEffect, useState } from "react";
import { accountMemberships } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteMembershipsScreen } from "../screens/AthleteMembershipsScreen";
import { mapApiMembershipToAthlete } from "./api-memberships";
import {
  ATHLETE_MEMBERSHIPS,
  type AthleteMembership,
} from "./memberships-data";

/**
 * Client gate: live memberships for signed-in athletes, demo fixtures otherwise.
 */
export function AthleteMembershipsGate() {
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
      setMemberships(ATHLETE_MEMBERSHIPS);
      return;
    }
    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) setMemberships([]);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload]);

  const handleRenew = useCallback(
    async (membership: AthleteMembership) => {
      if (!membership.clubId || !membership.planId) return;
      setPending(true);
      setActionError(null);
      try {
        const created = await accountMemberships.purchase({
          clubId: membership.clubId,
          planId: membership.planId,
          idempotencyKey: `membership-renew:${membership.clubId}:${membership.planId}:${Date.now()}`,
        });
        if (created.paymentId) {
          try {
            const { accountFinance } = await import("@/shared/lib/api");
            const invoice = await accountFinance.issueInvoiceFromPayment({
              paymentId: created.paymentId,
            });
            window.location.assign(
              `/athlete/payment/${invoice.id}?status=success&source=membership`,
            );
            return;
          } catch {
            // Membership renew succeeded even if invoice issue failed.
          }
        }
        await reload();
      } catch {
        setActionError("تمدید/خرید عضویت ناموفق بود.");
      } finally {
        setPending(false);
      }
    },
    [reload],
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
        onRenew={isAuthenticated ? handleRenew : undefined}
        pending={pending}
      />
    </>
  );
}
