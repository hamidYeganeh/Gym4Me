import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import type { PlatformPlan } from "@repo/api";
import { Typography } from "@heroui/react/typography";
import { getTranslations } from "next-intl/server";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { JsonLd } from "@/shared/components/JsonLd";
import { membershipsApi } from "@/shared/lib/api";
import { PricingEmptySection } from "../../sections/PricingEmptySection";
import { PricingPlansSection } from "../../sections/PricingPlansSection";
import { pricingScreenVariants as styles } from "./PricingScreen.styles";

export async function PricingScreen() {
  const t = await getTranslations("MarketingLanding.pricing");
  const slots = styles();
  let plans: PlatformPlan[] = [];

  try {
    plans = (await membershipsApi.listPublicPlatformPlans()).result;
  } catch {
    plans = [];
  }

  return (
    <>
      <PublicSiteHeader />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: t("schemaProductName"),
          offers: plans.map((plan) => ({
            "@type": "Offer",
            name: plan.name,
            price: plan.pricing.amount,
            priceCurrency: "IRR",
          })),
        }}
      />
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
          </header>
          {plans.length ? (
            <PricingPlansSection ctaHref="/for-clubs" plans={plans} />
          ) : (
            <PricingEmptySection />
          )}
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
