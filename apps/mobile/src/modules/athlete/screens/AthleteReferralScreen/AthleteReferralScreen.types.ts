import type { AthleteReferralView } from "@/modules/athlete/lib/referral-data";

export type AthleteReferralScreenProps = {
  view: AthleteReferralView;
  pending?: boolean;
  onInvite?: (phones: string[]) => Promise<void> | void;
  className?: string;
};
