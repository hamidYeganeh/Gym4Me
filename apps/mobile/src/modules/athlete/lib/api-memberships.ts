import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { ClubMembership } from "@repo/api";
import {
  faDigits,
  formatJalaliFullDate,
  formatTomans,
} from "@/shared/lib/booking-view";
import type {
  AthleteMembership,
  MembershipState,
} from "./memberships-data";

const EXPIRING_WITHIN_DAYS = 7;

function membershipState(item: ClubMembership): MembershipState {
  if (item.status === "expired" || item.status === "cancelled") {
    return "expired";
  }
  if (item.status === "frozen") {
    return "expiring";
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
  if (typeof item.credit.remainingSessions === "number") {
    return Math.max(item.credit.remainingSessions, 1);
  }
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

function expiresLabel(item: ClubMembership): string {
  if (item.status === "frozen" && item.freeze?.frozenAt) {
    return `فریز از ${formatJalaliFullDate(item.freeze.frozenAt)}`;
  }
  if (item.credit?.expiresAt) {
    const prefix = item.status === "expired" ? "منقضی‌شده در" : "اعتبار تا";
    return `${prefix} ${formatJalaliFullDate(item.credit.expiresAt)}`;
  }
  return "بدون تاریخ انقضا";
}

export function mapApiMembershipToAthlete(
  item: ClubMembership,
): AthleteMembership {
  const total = sessionsTotal(item);
  const used = sessionsUsed(item, total);
  return {
    id: item.id,
    clubId: item.clubId,
    planId: item.planId,
    clubName: item.clubName ?? "باشگاه",
    planName: item.planName ?? "عضویت",
    image: PLACEHOLDER_IMAGE,
    state: membershipState(item),
    sessionsUsed: used,
    sessionsTotal: total,
    expiresLabel: expiresLabel(item),
    priceLabel: item.pricing
      ? formatTomans(item.pricing.amount)
      : faDigits("—"),
  };
}
