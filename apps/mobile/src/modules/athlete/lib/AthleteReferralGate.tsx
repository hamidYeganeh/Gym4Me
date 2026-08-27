"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type ReferralInvite } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { accountReferral } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
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
  const t = useTranslations("AthleteReferral");
  const { isAuthenticated, isReady } = useAuth();
  const [view, setView] = useState<AthleteReferralView | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<"auth" | "load" | null>(null);

  const reload = useCallback(async () => {
    setError(null);
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
      setView(DEMO_MODE ? DEMO_REFERRAL : null);
      setError(DEMO_MODE ? null : "auth");
      return;
    }

    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) {
        setView(DEMO_MODE ? DEMO_REFERRAL : null);
        setError(DEMO_MODE ? null : "load");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload]);

  const handleInvite = useCallback(
    async (phones: string[]) => {
      if (!isAuthenticated) return;
      setPending(true);
      try {
        await accountReferral.invite({ phones });
        await reload();
      } catch (err) {
        if (!(err instanceof ApiError)) {
          toast.error(t("toastErrorTitle"), {
            description: t("inviteError"),
          });
        }
      } finally {
        setPending(false);
      }
    },
    [isAuthenticated, reload, t],
  );

  if (!view && error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <Typography className="text-danger" type="body">
          {error === "auth" ? t("authRequired") : t("loadError")}
        </Typography>
        {error === "load" ? (
          <Button onPress={() => void reload()} variant="secondary">
            {t("retry")}
          </Button>
        ) : null}
      </div>
    );
  }

  if (!view) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteReferralScreen
      onInvite={isAuthenticated ? handleInvite : undefined}
      pending={pending}
      view={view}
    />
  );
}
