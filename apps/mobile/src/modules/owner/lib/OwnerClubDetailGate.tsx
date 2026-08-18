"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { Club, ClubClass } from "@repo/api";
import { useEffect, useState } from "react";
import {
  accountClubs,
  clubOwnerClubSlots,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerClubDetailScreen } from "../screens/OwnerClubDetailScreen";
import {
  getOwnerClubDetail,
  type OwnerClubDetail,
  type OwnerClubDetailClass,
} from "./owner-club-detail-data";

function mapClasses(classes: ClubClass[]): OwnerClubDetailClass[] {
  return classes.map((cls) => ({
    id: cls.id,
    title: cls.title,
    coach: "—",
    scheduleLabel: cls.description ?? "—",
    enrolled: 0,
    capacity: 0,
    state: cls.status === "active" ? "active" : "paused",
  }));
}

function mapClubDetail(club: Club, classes: ClubClass[]): OwnerClubDetail {
  const demo = getOwnerClubDetail("heavenly");
  return {
    id: club.id,
    name: club.identity.name,
    city:
      club.location?.node?.name ??
      club.location?.address?.split("،")[0] ??
      "—",
    revenueValue: demo?.revenueValue ?? 0,
    revenueSeries: demo?.revenueSeries ?? [],
    revenueComparisonSeries: demo?.revenueComparisonSeries ?? [],
    attendanceValue: demo?.attendanceValue ?? 0,
    attendanceSeries: demo?.attendanceSeries ?? [],
    occupancyTrend: demo?.occupancyTrend ?? [],
    today: demo?.today ?? [],
    branches: [
      {
        id: club.id,
        name: club.identity.name,
        address: club.location?.address ?? "—",
        capacityLabel: "—",
        state:
          club.operationalStatus === "inactive" ? "maintenance" : "active",
      },
    ],
    classes: mapClasses(classes),
    slotDays: demo?.slotDays ?? [],
  };
}

type Props = { clubId: string };

export function OwnerClubDetailGate({ clubId }: Props) {
  const { isAuthenticated, isReady } = useAuth();
  const [club, setClub] = useState<OwnerClubDetail | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    if (!isDiscoveryApiId(clubId)) {
      const demo = getOwnerClubDetail(clubId) ?? null;
      setClub(demo);
      setMissing(!demo);
      return;
    }

    if (!isAuthenticated) {
      setMissing(true);
      return;
    }

    let cancelled = false;
    Promise.all([
      accountClubs.get(clubId),
      clubOwnerClubSlots.listClasses(clubId).catch(() => ({ result: [] as ClubClass[] })),
    ])
      .then(([apiClub, classesPage]) => {
        if (cancelled) return;
        setClub(mapClubDetail(apiClub, classesPage.result));
        setMissing(false);
      })
      .catch(() => {
        if (!cancelled) {
          setClub(null);
          setMissing(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clubId, isAuthenticated, isReady]);

  if (!club && !missing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          باشگاه پیدا نشد.
        </Typography>
      </div>
    );
  }

  return <OwnerClubDetailScreen club={club} />;
}
