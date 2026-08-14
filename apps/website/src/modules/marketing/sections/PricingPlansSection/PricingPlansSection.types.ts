import type { PlatformPlan } from "@repo/api";

export type PricingPlansSectionProps = {
  plans: PlatformPlan[];
  ctaHref: string;
  ctaLabel: string;
};
