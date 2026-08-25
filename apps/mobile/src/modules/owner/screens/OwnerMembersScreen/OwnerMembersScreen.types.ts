import type {
  ClubMembershipPlan,
  ImportMembershipRow,
  ImportMembershipsResult,
  MembershipRenewalPreview,
  PaymentChannel,
  RenewMembershipInput,
} from "@repo/api";
import type {
  OwnerMember,
  OwnerMembersStats,
  OwnerMembershipState,
} from "../../lib/owner-members-data";

export type OwnerMembersFilterId = "all" | OwnerMembershipState;

export type OwnerMembersSellInput = {
  planId: string;
  guestName: string;
  guestPhone: string;
  idempotencyKey: string;
  channel: Extract<PaymentChannel, "cash" | "pos" | "card_to_card" | "mixed">;
  paidAmount?: number;
  externalRef?: string;
  tenders?: Array<{
    channel: Extract<PaymentChannel, "cash" | "pos" | "card_to_card">;
    amount: number;
  }>;
  debt?: { dueAt: string; installmentCount?: number };
};

export type OwnerMembersRenewInput = Pick<
  RenewMembershipInput,
  "channel" | "paidAmount" | "externalRef" | "tenders" | "debt"
>;

export type OwnerMembersScreenProps = {
  members: OwnerMember[];
  stats: OwnerMembersStats;
  className?: string;
  plans?: ClubMembershipPlan[];
  pending?: boolean;
  onCheckIn?: (member: OwnerMember) => Promise<void> | void;
  onFreeze?: (member: OwnerMember) => Promise<void> | void;
  onUnfreeze?: (member: OwnerMember) => Promise<void> | void;
  onPreviewRenewal?: (
    member: OwnerMember,
  ) => Promise<MembershipRenewalPreview>;
  onRenew?: (
    member: OwnerMember,
    preview: MembershipRenewalPreview,
    idempotencyKey: string,
    payment: OwnerMembersRenewInput,
  ) => Promise<void>;
  onSell?: (input: OwnerMembersSellInput) => Promise<void> | void;
  onImport?: (
    rows: ImportMembershipRow[],
    defaultPlanId: string | undefined,
    dryRun: boolean,
  ) => Promise<ImportMembershipsResult>;
};
