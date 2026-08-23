"use client";

import { Spinner } from "@heroui/react/spinner";
import type { Club } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useEffect, useState } from "react";
import { accountClubs, accountOps, mediaFileUrl } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerHomeScreen } from "../screens/OwnerHomeScreen";
import {
  OWNER_HOME_CLUBS,
  OWNER_HOME_STATS,
  OWNER_HOME_TASKS_NEW_COUNT,
  type OwnerHomeClub,
  type OwnerHomeStat,
} from "./owner-home-data";

function mapHomeClub(club: Club): OwnerHomeClub {
  return {
    id: club.id,
    title: club.identity.name,
    subtitle:
      club.location?.node?.name ?? club.location?.address ?? "موقعیت ثبت نشده",
    image: mediaFileUrl(club.identity.coverMediaId) ?? PLACEHOLDER_IMAGE,
    rating: club.reviewsSummary.average,
    ratingCount: club.reviewsSummary.count,
    price: "—",
  };
}

export function OwnerHomeGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [ready, setReady] = useState(false);
  const [tasksNewCount, setTasksNewCount] = useState(0);
  const [clubs, setClubs] = useState<OwnerHomeClub[]>([]);
  const [stats, setStats] = useState<OwnerHomeStat[]>([]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setTasksNewCount(DEMO_MODE ? OWNER_HOME_TASKS_NEW_COUNT : 0);
      setClubs(DEMO_MODE ? OWNER_HOME_CLUBS : []);
      setStats(DEMO_MODE ? OWNER_HOME_STATS : []);
      setReady(true);
      return;
    }

    let cancelled = false;
    accountClubs
      .list({ page_size: 20 })
      .then(async (clubs) => {
        if (cancelled) return;
        setClubs(clubs.result.map(mapHomeClub));
        setStats([]);
        const clubId = clubs.result[0]?.id;
        if (!clubId) {
          if (!cancelled) {
            setTasksNewCount(0);
            setReady(true);
          }
          return;
        }
        const summary = await accountOps
          .tasksSummary(clubId)
          .catch(() => ({ openCount: 0 }));
        if (!cancelled) {
          setTasksNewCount(summary.openCount);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTasksNewCount(0);
          setClubs([]);
          setStats([]);
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <OwnerHomeScreen
      clubs={clubs}
      stats={stats}
      tasksNewCount={tasksNewCount}
    />
  );
}
