import type { OwnerMember } from "@/modules/owner/lib/owner-members-data";
import type { OwnerMembersFilterId } from "@/modules/owner/screens/OwnerMembersScreen/OwnerMembersScreen.types";
import type { UseOwnerMembersScreenReturn } from "@/modules/owner/lib/use-owner-members-screen";

export type OwnerMembersListSectionProps = Pick<
  UseOwnerMembersScreenReturn,
  | "query"
  | "setQuery"
  | "activeFilter"
  | "setActiveFilter"
  | "checkedInIds"
  | "pendingId"
  | "filteredMembers"
  | "toggleCheckIn"
> & {
  pending?: boolean;
  filters: readonly { id: OwnerMembersFilterId; label: string }[];
  searchLabel: string;
  searchPlaceholder: string;
  filtersLabel: string;
  listLabel: string;
  sessionsLabel: string;
  checkedInChip: string;
  emptyTitle: string;
  emptyBody: string;
  stateLabels: Record<
    "active" | "expiring" | "frozen" | "expired",
    string
  >;
  checkInAction: (values: { name: string }) => string;
  unfreezeAction: string;
  freezeAction: string;
  renewAction: string;
  onFreeze?: (member: OwnerMember) => Promise<void> | void;
  onUnfreeze?: (member: OwnerMember) => Promise<void> | void;
  onRenew?: (member: OwnerMember) => Promise<void> | void;
  className?: string;
};
