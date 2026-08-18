"use client";

import { Spinner } from "@heroui/react/spinner";
import type { ClubStaffMember } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useEffect, useState } from "react";
import { accountClubs, accountStaff } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerStaffScreen } from "../screens/OwnerStaffScreen";
import {
  OWNER_STAFF,
  OWNER_STAFF_GRANT_LABELS,
  type OwnerStaffMember,
  type OwnerStaffState,
} from "./owner-staff-data";

const PRESET_LABEL: Record<string, string> = {
  manager: "مدیر شعبه",
  reception: "پذیرش",
  accountant: "حسابدار",
  custom: "سفارشی",
};

function mapStaffState(member: ClubStaffMember): OwnerStaffState {
  if (member.status === "suspended" || member.status === "revoked") {
    return "suspended";
  }
  if (!member.acceptedAt && member.invitedAt) return "invited";
  return "active";
}

function mapStaff(member: ClubStaffMember): OwnerStaffMember {
  return {
    id: member.id,
    name: member.userId.slice(-6),
    avatar: PLACEHOLDER_IMAGE,
    presetLabel: PRESET_LABEL[member.preset] ?? member.preset,
    branchLabel: "باشگاه فعلی",
    grants: member.permissions,
    state: mapStaffState(member),
  };
}

export function OwnerStaffGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [staff, setStaff] = useState<OwnerStaffMember[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setStaff(OWNER_STAFF);
      return;
    }

    let cancelled = false;
    accountClubs
      .list({ page_size: 1 })
      .then(async (clubs) => {
        const clubId = clubs.result[0]?.id;
        if (!clubId) {
          if (!cancelled) setStaff([]);
          return;
        }
        const page = await accountStaff.list(clubId, { page_size: 100 });
        if (!cancelled) setStaff(page.result.map(mapStaff));
      })
      .catch(() => {
        if (!cancelled) setStaff([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!staff) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <OwnerStaffScreen
      grantLabels={OWNER_STAFF_GRANT_LABELS}
      staff={staff}
    />
  );
}
