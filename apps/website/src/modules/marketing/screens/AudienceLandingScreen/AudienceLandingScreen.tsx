import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import { Typography } from "@heroui/react/typography";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { audienceLandingScreenVariants as styles } from "./AudienceLandingScreen.styles";
import type {
  AudienceLandingScreenCapability,
  AudienceLandingScreenProps,
} from "./AudienceLandingScreen.types";

export async function AudienceLandingScreen({
  audience,
}: AudienceLandingScreenProps) {
  const t = await getTranslations(`MarketingLanding.audience.${audience}`);
  const shared = await getTranslations("MarketingLanding.audience");
  const slots = styles();
  const capabilities = t.raw("capabilities") as AudienceLandingScreenCapability[];
  const outcomes = t.raw("outcomes") as string[];

  return (
    <>
      <PublicSiteHeader />
      <main className={slots.root()}>
        <div className={slots.container()}>
          <header className={slots.header()}>
            <Typography className={slots.eyebrow()} type="body-sm">
              {t("eyebrow")}
            </Typography>
            <Typography className={slots.title()} type="h1" weight="bold">
              {t("title")}
            </Typography>
            <Typography className={slots.description()} type="body">
              <TextWithBrand>{t("description")}</TextWithBrand>
            </Typography>
            <div className={slots.actions()}>
              <Link className={slots.primaryCta()} href={t("primaryHref")}>
                {t("primaryLabel")}
              </Link>
              <Link className={slots.secondaryCta()} href={t("secondaryHref")}>
                {t("secondaryLabel")}
              </Link>
            </div>
          </header>
          <section className={slots.capabilitiesSection()}>
            <Typography className={slots.sectionTitle()} type="h2" weight="bold">
              {shared("capabilitiesTitle")}
            </Typography>
            <div className={slots.capabilitiesGrid()}>
              {capabilities.map((item) => (
                <article className={slots.capabilityCard()} key={item.title}>
                  <Typography
                    className={slots.capabilityTitle()}
                    type="h3"
                    weight="semibold"
                  >
                    {item.title}
                  </Typography>
                  <Typography className={slots.capabilityBody()} type="body-sm">
                    <TextWithBrand>{item.description}</TextWithBrand>
                  </Typography>
                </article>
              ))}
            </div>
          </section>
          <section className={slots.outcomesSection()}>
            <Typography className={slots.sectionTitle()} type="h2" weight="bold">
              {shared("outcomesTitle")}
            </Typography>
            <ul className={slots.outcomesGrid()}>
              {outcomes.map((outcome) => (
                <li className={slots.outcomeItem()} key={outcome}>
                  <Typography type="body-sm">
                    <TextWithBrand>{outcome}</TextWithBrand>
                  </Typography>
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
