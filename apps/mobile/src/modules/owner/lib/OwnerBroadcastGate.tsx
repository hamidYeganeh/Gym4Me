"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type ClubBroadcast } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { accountClubs, accountLifecycle } from "@/shared/lib/api";
import { formatJalaliDateTime } from "@/shared/lib/booking-view";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerBroadcastScreen } from "../screens/OwnerBroadcastScreen";
import type { OwnerBroadcastForm } from "../screens/OwnerBroadcastScreen/OwnerBroadcastScreen.types";
import {
  OWNER_BROADCASTS,
  type OwnerBroadcastEntry,
} from "./owner-broadcast-data";

function mapBroadcast(item: ClubBroadcast): OwnerBroadcastEntry {
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    audience: item.audience,
    sentAtLabel: formatJalaliDateTime(item.createdAt),
    recipientCount: item.recipientCount,
  };
}

export function OwnerBroadcastGate() {
  const t = useTranslations("OwnerBroadcast");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [broadcasts, setBroadcasts] = useState<OwnerBroadcastEntry[] | null>(
    DEMO_MODE ? OWNER_BROADCASTS : null,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const clubs = await accountClubs.list({ page_size: 1 });
    const selectedClubId = clubs.result[0]?.id;
    if (!selectedClubId) {
      setClubId(null);
      setBroadcasts([]);
      return;
    }
    const page = await accountLifecycle.listBroadcasts(selectedClubId, 1, 100);
    setClubId(selectedClubId);
    setBroadcasts(page.result.map(mapBroadcast));
  }, []);

  useEffect(() => {
    if (!isReady || DEMO_MODE) return;
    if (!isAuthenticated || activeRole !== "club_owner") {
      setBroadcasts([]);
      setError(t("unauthorized"));
      return;
    }
    void load().catch((cause: unknown) => {
      setBroadcasts([]);
      setError(cause instanceof ApiError ? cause.message : t("loadError"));
    });
  }, [activeRole, isAuthenticated, isReady, load, t]);

  const send = useCallback(async (form: OwnerBroadcastForm) => {
    if (!clubId) return;
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
    };
    const fingerprint = JSON.stringify(payload);
    if (attempt.current?.fingerprint !== fingerprint) {
      attempt.current = { fingerprint, key: crypto.randomUUID() };
    }
    setPending(true);
    setError(null);
    try {
      await accountLifecycle.createBroadcast(clubId, {
        ...payload,
        idempotencyKey: attempt.current.key,
      });
      attempt.current = null;
      await load();
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : t("sendError"));
      throw cause;
    } finally {
      setPending(false);
    }
  }, [clubId, load, t]);

  if (broadcasts === null) {
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
      <OwnerBroadcastScreen
        broadcasts={broadcasts}
        onSend={clubId ? send : undefined}
        pending={pending}
      />
    </>
  );
}
