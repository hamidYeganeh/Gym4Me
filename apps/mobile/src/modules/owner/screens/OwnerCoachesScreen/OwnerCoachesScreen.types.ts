import type { OwnerCoachAffiliation } from "../../lib/owner-coaches-data";

export type OwnerCoachInviteForm = {
  name: string;
  branchLabel: string;
  commissionPercent: string;
};

export type OwnerCoachesScreenProps = {
  coaches: OwnerCoachAffiliation[];
  form: OwnerCoachInviteForm;
  pending?: boolean;
  onFormChange: (patch: Partial<OwnerCoachInviteForm>) => void;
  onInvite?: () => void;
  className?: string;
};
