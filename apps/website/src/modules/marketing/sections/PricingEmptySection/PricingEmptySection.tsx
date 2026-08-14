import Link from "next/link";
import { pricingEmptySectionVariants } from "./PricingEmptySection.styles";
import type { PricingEmptySectionProps } from "./PricingEmptySection.types";

export function PricingEmptySection({
  title,
  body,
  ctaHref,
  ctaLabel,
}: PricingEmptySectionProps) {
  const slots = pricingEmptySectionVariants();

  return (
    <section className={slots.emptySection()}>
      <h2 className={slots.emptyTitle()}>{title}</h2>
      <p className={slots.emptyBody()}>{body}</p>
      <Link className={slots.emptyCta()} href={ctaHref}>
        {ctaLabel}
      </Link>
    </section>
  );
}
