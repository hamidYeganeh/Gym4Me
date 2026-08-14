import Link from "next/link";
import { pricingPlansSectionVariants } from "./PricingPlansSection.styles";
import type { PricingPlansSectionProps } from "./PricingPlansSection.types";

export function PricingPlansSection({
  plans,
  ctaHref,
  ctaLabel,
}: PricingPlansSectionProps) {
  const slots = pricingPlansSectionVariants();

  return (
    <section className={slots.grid()}>
      {plans.map((plan) => (
        <article className={slots.plan()} key={plan.id}>
          <h2 className={slots.planTitle()}>{plan.name}</h2>
          <p className={slots.planDescription()}>
            {plan.description || "پلن مدیریت عملیات روزانه باشگاه"}
          </p>
          <p className={slots.planPrice()}>
            {plan.pricing.amount === 0
              ? "رایگان"
              : `${plan.pricing.amount.toLocaleString("fa-IR")} تومان`}
          </p>
          <p className={slots.planPeriod()}>
            هر {plan.pricing.periodDays.toLocaleString("fa-IR")} روز
          </p>
          <ul className={slots.featureList()}>
            {plan.features.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
          <Link className={slots.planCta()} href={ctaHref}>
            {ctaLabel}
          </Link>
        </article>
      ))}
    </section>
  );
}
