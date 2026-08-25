import type { SubscriptionPlan } from "../../lib/athlete-subscription-data";

export type AthleteSubscriptionScreenProps = {
  plans: SubscriptionPlan[];
  currentPlanId: string;
  pending?: boolean;
  onUpgrade?: (planId: string) => void | Promise<void>;
  title?: string;
  subtitle?: string;
  className?: string;
};
