import Link from "next/link";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { audienceLandingVariants as styles } from "./AudienceLanding.styles";
import type { AudienceLandingProps } from "./AudienceLanding.types";

export function AudienceLanding({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  capabilities,
  outcomes,
}: AudienceLandingProps) {
  const slots = styles();

  return (
    <>
      <PublicSiteHeader />
      <main className={slots.root()}>
        <div className={slots.container()}>
          <header className={slots.header()}>
            <p className={slots.eyebrow()}>{eyebrow}</p>
            <h1 className={slots.title()}>{title}</h1>
            <p className={slots.description()}>{description}</p>
            <div className={slots.actions()}>
              <Link className={slots.primaryCta()} href={primary.href}>
                {primary.label}
              </Link>
              <Link className={slots.secondaryCta()} href={secondary.href}>
                {secondary.label}
              </Link>
            </div>
          </header>
          <section className={slots.capabilitiesSection()}>
            <h2 className={slots.sectionTitle()}>
              کارهایی که از روز اول انجام می‌شود
            </h2>
            <div className={slots.capabilitiesGrid()}>
              {capabilities.map((item) => (
                <article className={slots.capabilityCard()} key={item.title}>
                  <h3 className={slots.capabilityTitle()}>{item.title}</h3>
                  <p className={slots.capabilityBody()}>{item.description}</p>
                </article>
              ))}
            </div>
          </section>
          <section className={slots.outcomesSection()}>
            <h2 className={slots.sectionTitle()}>خروجی قابل‌اندازه‌گیری</h2>
            <ul className={slots.outcomesGrid()}>
              {outcomes.map((outcome) => (
                <li className={slots.outcomeItem()} key={outcome}>
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
