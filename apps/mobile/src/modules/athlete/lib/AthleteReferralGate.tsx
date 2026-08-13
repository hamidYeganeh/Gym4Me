"use client";

import { Spinner, Typography } from "@heroui/react";
import type { ReferralInvite } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountReferral } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteReferralScreen } from "../screens/AthleteReferralScreen";
import {
  DEMO_REFERRAL,
  normalizeInviteStatus,
  type AthleteReferralInvite,
  type AthleteReferralView,
} from "./referral-data";

function buildInviteUrl(code: string): string {
  if (typeof window === "undefined") {
    return `https://gym4me.app/auth?ref=${encodeURIComponent(code)}`;
  }
  const origin = window.location.origin;
  return `${origin}/auth?ref=${encodeURIComponent(code)}`;
}

function mapInvite(invite: ReferralInvite): AthleteReferralInvite {
  return {
    id: invite.id,
    phone: invite.phone,
    status: normalizeInviteStatus(invite.status),
    createdLabel: new Date(invite.createdAt).toLocaleDateString("fa-IR"),
  };
}

export function AthleteReferralGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [view, setView] = useState<AthleteReferralView | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [me, invites] = await Promise.all([
      accountReferral.me(),
      accountReferral.listInvites(),
    ]);
    setView({
      referralCode: me.referralCode,
      inviteUrl: buildInviteUrl(me.referralCode),
      stats: me.stats,
      invites: invites.items.map(mapInvite),
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setView(DEMO_REFERRAL);
      return;
    }

    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) setView(DEMO_REFERRAL);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload]);

  const handleInvite = useCallback(
    async (phones: string[]) => {
      if (!isAuthenticated) return;
      setPending(true);
      setError(null);
      try {
        await accountReferral.invite({ phones });
        await reload();
      } catch {
        setError("invite");
      } finally {
        setPending(false);
      }
    },
    [isAuthenticated, reload],
  );

  if (!view) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="px-4 pt-2 text-center">
          <Typography className="text-danger" type="body-sm">
            ارسال دعوت ناموفق بود.
          </Typography>
        </div>
      ) : null}
      <AthleteReferralScreen
        onInvite={isAuthenticated ? handleInvite : undefined}
        pending={pending}
        view={view}
      />
    </>
  );
}
