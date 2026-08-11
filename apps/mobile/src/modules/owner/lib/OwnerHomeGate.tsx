"use client";

import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { accountClubs, accountOps } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerHomeScreen } from "../screens/OwnerHomeScreen";
import {
  OWNER_HOME_CLUBS,
  OWNER_HOME_STATS,
  OWNER_HOME_TASKS_NEW_COUNT,
} from "./owner-home-data";

export function OwnerHomeGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [ready, setReady] = useState(false);
  const [tasksNewCount, setTasksNewCount] = useState(OWNER_HOME_TASKS_NEW_COUNT);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setTasksNewCount(OWNER_HOME_TASKS_NEW_COUNT);
      setReady(true);
      return;
    }

    let cancelled = false;
    accountClubs
      .list({ page_size: 1 })
      .then(async (clubs) => {
        const clubId = clubs.result[0]?.id;
        if (!clubId) {
          if (!cancelled) {
            setTasksNewCount(0);
            setReady(true);
          }
          return;
        }
        const summary = await accountOps.tasksSummary(clubId);
        if (!cancelled) {
          setTasksNewCount(summary.openCount);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTasksNewCount(OWNER_HOME_TASKS_NEW_COUNT);
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
      clubs={OWNER_HOME_CLUBS}
      stats={OWNER_HOME_STATS}
      tasksNewCount={tasksNewCount}
    />
  );
}
