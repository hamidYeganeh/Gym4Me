import { statsColors } from "@repo/theme/stats-colors";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { ClubMembership } from "@repo/api";
import {
  formatJalaliDateTime,
  formatJalaliFullDate,
} from "@/shared/lib/booking-view";
import type {
  OwnerMember,
  OwnerMembersStats,
  OwnerMembershipState,
} from "./owner-members-data";

const EXPIRING_WITHIN_DAYS = 7;

export function mapMembershipState(
  item: ClubMembership,
): OwnerMembershipState {
  if (item.status === "frozen") return "frozen";
  if (item.status === "expired" || item.status === "cancelled") {
    return "expired";
  }
  const expiresAt = item.credit?.expiresAt
    ? new Date(item.credit.expiresAt).getTime()
    : null;
  if (
    expiresAt !== null &&
    expiresAt - Date.now() <= EXPIRING_WITHIN_DAYS * 86_400_000
  ) {
    return "expiring";
  }
  return "active";
}

function sessionsTotal(item: ClubMembership): number {
  if (item.sessionsTotal && item.sessionsTotal > 0) return item.sessionsTotal;
  if (item.entriesTotal && item.entriesTotal > 0) return item.entriesTotal;
  return 1;
}

function sessionsUsed(item: ClubMembership, total: number): number {
  if (typeof item.credit.remainingSessions === "number") {
    return Math.max(0, total - item.credit.remainingSessions);
  }
  if (typeof item.credit.remainingEntries === "number" && item.entriesTotal) {
    return Math.max(0, item.entriesTotal - item.credit.remainingEntries);
  }
  return item.status === "expired" ? total : 0;
}

export function mapApiMembershipToOwnerMember(
  item: ClubMembership,
): OwnerMember {
  const total = sessionsTotal(item);
  const used = sessionsUsed(item, total);
  const state = mapMembershipState(item);

  let expiresLabel = "بدون تاریخ انقضا";
  if (state === "frozen" && item.freeze?.frozenAt) {
    expiresLabel = `فریز از ${formatJalaliFullDate(item.freeze.frozenAt)}`;
  } else if (item.credit?.expiresAt) {
    expiresLabel =
      state === "expired"
        ? `منقضی از ${formatJalaliFullDate(item.credit.expiresAt)}`
        : `اعتبار تا ${formatJalaliFullDate(item.credit.expiresAt)}`;
  }

  return {
    id: item.id,
    holderUserId: item.holder.userId,
    clubId: item.clubId,
    name: item.holder.displayName ?? item.holder.guest?.name ?? "عضو",
    avatar: PLACEHOLDER_IMAGE,
    planName: item.planName ?? "عضویت",
    joinedLabel: `عضویت از ${formatJalaliFullDate(item.createdAt)}`,
    expiresLabel,
    sessionsUsed: used,
    sessionsTotal: total,
    membershipState: state,
    lastCheckInLabel: item.updatedAt
      ? `آخرین به‌روزرسانی: ${formatJalaliDateTime(item.updatedAt)}`
      : "—",
    renewalEligible:
      item.status !== "cancelled" && item.status !== "transferred",
  };
}

export function buildOwnerMembersStats(
  members: OwnerMember[],
): OwnerMembersStats {
  const active = members.filter(
    (m) => m.membershipState === "active" || m.membershipState === "expiring",
  ).length;
  const seriesBase = Math.max(active - 6, 0);
  const activeSeries = [0, 1, 2, 3, 4, 5, 6].map(
    (i) => seriesBase + Math.min(i, active),
  );
  return {
    activeValue: active,
    activeSeries,
    activeComparisonSeries: activeSeries.map((v) => Math.max(0, v - 2)),
    activeColor: statsColors.blue,
    weekValue: members.length,
    weekSeries: activeSeries,
    weekColor: statsColors.purple,
  };
}
