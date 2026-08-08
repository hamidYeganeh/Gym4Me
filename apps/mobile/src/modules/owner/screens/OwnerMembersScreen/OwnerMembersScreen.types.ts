import type {
  OwnerMember,
  OwnerMembersStats,
  OwnerMembershipState,
} from "../../lib/owner-members-data";

export type OwnerMembersFilterId = "all" | OwnerMembershipState;

export type OwnerMembersScreenProps = {
  members: OwnerMember[];
  stats: OwnerMembersStats;
  className?: string;
};
