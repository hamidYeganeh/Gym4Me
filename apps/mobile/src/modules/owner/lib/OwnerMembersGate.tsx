"use client";

import { Spinner, Typography } from "@heroui/react";
import type {
  ClubMembershipPlan,
  ImportMembershipRow,
  ImportMembershipsResult,
} from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import {
  accountCheckin,
  accountClubs,
  accountMemberships,
} from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerMembersScreen } from "../screens/OwnerMembersScreen";
import type { OwnerMembersSellInput } from "../screens/OwnerMembersScreen/OwnerMembersScreen.types";
import {
  buildOwnerMembersStats,
  mapApiMembershipToOwnerMember,
} from "./api-owner-members";
import {
  OWNER_MEMBERS,
  OWNER_MEMBERS_STATS,
  type OwnerMember,
  type OwnerMembersStats,
} from "./owner-members-data";

/**
 * Client gate: live club memberships for the owner's first club.
 * Falls back to demo fixtures when unauthenticated.
 */
export function OwnerMembersGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [members, setMembers] = useState<OwnerMember[] | null>(null);
  const [stats, setStats] = useState<OwnerMembersStats>(OWNER_MEMBERS_STATS);
  const [plans, setPlans] = useState<ClubMembershipPlan[]>([]);
  const [clubId, setClubId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    const clubs = await accountClubs.list({ page_size: 1 });
    const firstClubId = clubs.result[0]?.id;
    if (!firstClubId) {
      setClubId(null);
      setMembers([]);
      setPlans([]);
      setStats(buildOwnerMembersStats([]));
      return;
    }
    setClubId(firstClubId);
    const [page, planPage] = await Promise.all([
      accountMemberships.listClubMemberships(firstClubId, { page_size: 100 }),
      accountMemberships.listClubPlans(firstClubId, { page_size: 50 }),
    ]);
    const mapped = page.result.map(mapApiMembershipToOwnerMember);
    setMembers(mapped);
    setPlans(planPage.result);
    setStats(buildOwnerMembersStats(mapped));
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setMembers(OWNER_MEMBERS);
      setStats(OWNER_MEMBERS_STATS);
      setPlans([]);
      setClubId(null);
      return;
    }
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) {
        setError("load");
        setMembers([]);
        setStats(buildOwnerMembersStats([]));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, load]);

  const handleCheckIn = useCallback(
    async (member: OwnerMember) => {
      if (!clubId || !member.holderUserId) return;
      await accountCheckin.checkInByMembership(clubId, {
        membershipId: member.id,
        userId: member.holderUserId,
        method: "manual",
      });
    },
    [clubId],
  );

  const handleFreeze = useCallback(
    async (member: OwnerMember) => {
      if (!clubId) return;
      setPending(true);
      try {
        await accountMemberships.freeze(clubId, member.id, {});
        await load();
      } finally {
        setPending(false);
      }
    },
    [clubId, load],
  );

  const handleUnfreeze = useCallback(
    async (member: OwnerMember) => {
      if (!clubId) return;
      setPending(true);
      try {
        await accountMemberships.unfreeze(clubId, member.id);
        await load();
      } finally {
        setPending(false);
      }
    },
    [clubId, load],
  );

  const handleSell = useCallback(
    async (input: OwnerMembersSellInput) => {
      if (!clubId) return;
      setPending(true);
      try {
        await accountMemberships.sell(clubId, {
          planId: input.planId,
          holder: {
            guest: { name: input.guestName, phone: input.guestPhone },
          },
          channel: input.channel,
          paidAmount: input.paidAmount,
          externalRef: input.externalRef,
          tenders: input.tenders,
          debt: input.debt,
          idempotencyKey: input.idempotencyKey,
        });
        await load();
      } finally {
        setPending(false);
      }
    },
    [clubId, load],
  );

  const handleImport = useCallback(
    async (
      rows: ImportMembershipRow[],
      defaultPlanId: string | undefined,
      dryRun: boolean,
    ): Promise<ImportMembershipsResult> => {
      if (!clubId) throw new Error("Club is not selected");
      const fingerprint = rows.reduce((hash, row) => {
        const value = `${row.rowKey}:${row.phone}:${row.planId ?? ""}`;
        let next = hash;
        for (const char of value) next = (next * 31 + char.charCodeAt(0)) >>> 0;
        return next;
      }, 2166136261);
      const result = await accountMemberships.import(clubId, {
        batchKey: `csv:${clubId}:${fingerprint.toString(36)}`,
        defaultPlanId,
        dryRun,
        rows,
      });
      if (!dryRun) await load();
      return result;
    },
    [clubId, load],
  );

  if (!members) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-6 text-center">
        <Typography type="body">بارگذاری اعضا ناموفق بود.</Typography>
      </div>
    );
  }

  return (
    <OwnerMembersScreen
      members={members}
      onCheckIn={clubId ? handleCheckIn : undefined}
      onFreeze={clubId ? handleFreeze : undefined}
      onImport={clubId ? handleImport : undefined}
      onSell={clubId ? handleSell : undefined}
      onUnfreeze={clubId ? handleUnfreeze : undefined}
      pending={pending}
      plans={plans}
      stats={stats}
    />
  );
}
