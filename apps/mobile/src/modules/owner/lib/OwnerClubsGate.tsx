"use client";

import { Spinner } from "@heroui/react/spinner";
import type { Club } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useEffect, useState } from "react";
import { accountClubs, mediaFileUrl } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerClubsScreen } from "../screens/OwnerClubsScreen";
import {
  OWNER_CLUBS,
  type OwnerClub,
  type OwnerClubState,
} from "./owner-clubs-data";

function mapClubState(club: Club): OwnerClubState {
  if (
    club.operationalStatus === "inactive" ||
    club.review.status === "suspended"
  ) {
    return "suspended";
  }
  if (
    club.review.status === "pending_review" ||
    club.review.status === "draft" ||
    club.review.status === "rejected"
  ) {
    return "pending-review";
  }
  return "active";
}

function mapClub(club: Club): OwnerClub {
  const city =
    club.location?.node?.name ?? club.location?.address?.split("،")[0] ?? "—";
  return {
    id: club.id,
    name: club.identity.name,
    image: mediaFileUrl(club.identity.coverMediaId) ?? PLACEHOLDER_IMAGE,
    city,
    branchCount: club.parentClubId ? "۱" : "۱",
    memberCount: "—",
    occupancyPercent: 0,
    state: mapClubState(club),
    revenueMonthLabel:
      club.review.status === "approved" ? "باشگاه فعال" : "در انتظار تأیید",
  };
}

export function OwnerClubsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [clubs, setClubs] = useState<OwnerClub[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setClubs(DEMO_MODE ? OWNER_CLUBS : []);
      return;
    }

    let cancelled = false;
    accountClubs
      .list({ page_size: 100 })
      .then((page) => {
        if (cancelled) return;
        setClubs(page.result.map(mapClub));
      })
      .catch(() => {
        if (!cancelled) setClubs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!clubs) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <OwnerClubsScreen clubs={clubs} />;
}
