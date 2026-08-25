import type { MembershipCheckoutPreview } from "@repo/api";
import type { AthleteMembership } from "../../lib/memberships-data";

export type AthleteMembershipsScreenProps = {
  memberships: AthleteMembership[];
  pending?: boolean;
  onPreviewRenewal?: (
    membership: AthleteMembership,
  ) => Promise<MembershipCheckoutPreview>;
  onConfirmRenewal?: (
    membership: AthleteMembership,
    preview: MembershipCheckoutPreview,
    idempotencyKey: string,
  ) => Promise<void>;
};
