"use client";

import { Spinner } from "@heroui/react/spinner";
import type { CheckIn } from "@repo/api";
import { useEffect, useState } from "react";
import { accountCheckin, discoveryClubs } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteCheckInHistoryScreen } from "../screens/AthleteCheckInHistoryScreen";
import {
  DEMO_CHECK_INS,
  type AthleteCheckInItem,
  type CheckInMethod,
} from "./checkin-history-data";
import { toPersianDigits } from "./weight/format";

function formatOccurredLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "امروز";
  if (sameDay(date, yesterday)) return "دیروز";

  return date.toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTimeLabel(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return toPersianDigits(`${hh}:${mm}`);
}

async function resolveClubNames(
  clubIds: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(clubIds.filter(Boolean))];
  const entries = await Promise.all(
    unique.map(async (clubId) => {
      try {
        const club = await discoveryClubs.get(clubId);
        return [clubId, club.identity.name] as const;
      } catch {
        return [clubId, clubId.slice(-6)] as const;
      }
    }),
  );
  return new Map(entries);
}

function mapCheckIn(
  item: CheckIn,
  clubNames: Map<string, string>,
): AthleteCheckInItem {
  const method = (item.method ?? "manual") as CheckInMethod;
  return {
    id: item.id,
    clubId: item.clubId,
    clubName: clubNames.get(item.clubId) ?? item.clubId.slice(-6),
    method,
    occurredAt: item.occurredAt,
    occurredLabel: formatOccurredLabel(item.occurredAt),
    timeLabel: formatTimeLabel(item.occurredAt),
  };
}

export function AthleteCheckInHistoryGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [items, setItems] = useState<AthleteCheckInItem[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setItems(DEMO_CHECK_INS);
      return;
    }

    let cancelled = false;
    accountCheckin
      .listMine({ page_size: 50 })
      .then(async (page) => {
        if (cancelled) return;
        if (page.result.length === 0) {
          setItems([]);
          return;
        }
        const clubNames = await resolveClubNames(
          page.result.map((row) => row.clubId),
        );
        if (cancelled) return;
        setItems(page.result.map((row) => mapCheckIn(row, clubNames)));
      })
      .catch(() => {
        if (!cancelled) setItems(DEMO_CHECK_INS);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!items) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <AthleteCheckInHistoryScreen items={items} />;
}
