import type { AthleteMembership } from "../../lib/memberships-data";

export type AthleteMembershipsScreenProps = {
  memberships: AthleteMembership[];
  pending?: boolean;
  onRenew?: (membership: AthleteMembership) => Promise<void> | void;
};
