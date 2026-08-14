import type { PlatformPlan } from "@repo/api";
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
          name: "Gym4Me برای باشگاه‌ها",
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
            <p className={slots.eyebrow()}>تعرفه شفاف</p>
            <h1 className={slots.title()}>
              پلن متناسب با اندازه و عملیات باشگاه
            </h1>
            <p className={slots.description()}>
              مبلغ‌ها از کاتالوگ فعال محصول خوانده می‌شوند؛ امکانات پایه مالی،
              عضویت، رزرو و حضور در قرارداد به‌صورت شفاف مشخص است.
            </p>
          </header>
          {plans.length ? (
            <PricingPlansSection
              ctaHref="/for-clubs"
              ctaLabel="بررسی برای باشگاه من"
              plans={plans}
            />
          ) : (
            <PricingEmptySection
              body="هنوز پلن عمومی منتشر نشده است؛ تا انتشار کاتالوگ، قیمت اختصاصی بدون عدد ساختگی و پس از مشخص‌شدن تعداد شعب و اعضای فعال ارائه می‌شود."
              ctaHref="/for-clubs"
              ctaLabel="مشاهده دامنه امکانات"
              title="پذیرش پایلوت محدود"
            />
          )}
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
