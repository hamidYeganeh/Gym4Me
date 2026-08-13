"use client";

import { Spinner, Typography } from "@heroui/react";
import type { Waitlist } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountWaitlist } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteWaitlistScreen } from "../screens/AthleteWaitlistScreen";

export function AthleteWaitlistGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [items, setItems] = useState<Waitlist[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const page = await accountWaitlist.listMine({ page_size: 50 });
    setItems(page.result);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) {
        setError("load");
        setItems([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload]);

  const handleLeave = useCallback(
    async (waitlistId: string) => {
      setPendingId(waitlistId);
      try {
        await accountWaitlist.leave(waitlistId);
        await reload();
      } finally {
        setPendingId(null);
      }
    },
    [reload],
  );

  const handleClaim = useCallback(
    async (waitlistId: string, entryId: string) => {
      setPendingId(waitlistId);
      try {
        await accountWaitlist.claim(waitlistId, { entryId });
        await reload();
      } finally {
        setPendingId(null);
      }
    },
    [reload],
  );

  if (!items) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <Typography type="body">بارگذاری لیست انتظار ناموفق بود.</Typography>
      </div>
    );
  }

  return (
    <AthleteWaitlistScreen
      items={items}
      onClaim={isAuthenticated ? handleClaim : undefined}
      onLeave={isAuthenticated ? handleLeave : undefined}
      pendingId={pendingId}
    />
  );
}
