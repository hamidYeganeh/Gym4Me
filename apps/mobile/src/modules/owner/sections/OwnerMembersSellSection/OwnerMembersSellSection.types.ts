import type { ClubMembershipPlan } from "@repo/api";
import type { UseOwnerMembersScreenReturn } from "@/modules/owner/lib/use-owner-members-screen";

export type OwnerMembersSellSectionProps = Pick<
  UseOwnerMembersScreenReturn,
  | "sellPlanId"
  | "setSellPlanId"
  | "sellName"
  | "setSellName"
  | "sellPhone"
  | "setSellPhone"
  | "sellChannel"
  | "setSellChannel"
  | "sellPaidAmount"
  | "setSellPaidAmount"
  | "sellExternalRef"
  | "setSellExternalRef"
  | "cashTender"
  | "setCashTender"
  | "posTender"
  | "setPosTender"
  | "cardTender"
  | "setCardTender"
  | "debtDueAt"
  | "setDebtDueAt"
  | "installmentCount"
  | "setInstallmentCount"
  | "selectedPlan"
  | "planAmount"
  | "collectedAmount"
  | "submitSale"
  | "sellDisabled"
> & {
  plans: ClubMembershipPlan[];
  pending?: boolean;
  title: string;
  planLabel: string;
  planPriceLabel: (values: { amount: string }) => string;
  nameLabel: string;
  phoneLabel: string;
  channelLabel: string;
  channelCash: string;
  channelPos: string;
  channelCard: string;
  channelMixed: string;
  paidAmountLabel: string;
  referenceLabel: string;
  debtDueLabel: string;
  installmentCountLabel: string;
  submitLabel: string;
  className?: string;
};
