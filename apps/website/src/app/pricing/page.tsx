import type { Metadata } from "next";
import Link from "next/link";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/modules/discovery/components/PublicSiteHeader";
import { JsonLd } from "@/modules/discovery/lib/JsonLd";
import { membershipsApi } from "@/shared/lib/api";

export const metadata: Metadata = {
  title: "تعرفه نرم‌افزار مدیریت باشگاه",
  description:
    "پلن‌های فعال Gym4Me برای مدیریت عضویت، رزرو، صندوق، حضور و گزارش مالی باشگاه.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  let plans: Awaited<
    ReturnType<typeof membershipsApi.listPublicPlatformPlans>
  >["result"] = [];
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
      <main className="min-h-[70vh] bg-background px-6 py-16 text-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <header className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-sm font-semibold text-accent">تعرفه شفاف</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              پلن متناسب با اندازه و عملیات باشگاه
            </h1>
            <p className="leading-8 text-muted">
              مبلغ‌ها از کاتالوگ فعال محصول خوانده می‌شوند؛ امکانات پایه مالی،
              عضویت، رزرو و حضور در قرارداد به‌صورت شفاف مشخص است.
            </p>
          </header>
          {plans.length ? (
            <section className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  className="flex flex-col rounded-[2rem] border border-border bg-surface p-7"
                  key={plan.id}
                >
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  <p className="mt-3 min-h-14 text-sm leading-7 text-muted">
                    {plan.description || "پلن مدیریت عملیات روزانه باشگاه"}
                  </p>
                  <p className="mt-7 text-3xl font-bold">
                    {plan.pricing.amount === 0
                      ? "رایگان"
                      : `${plan.pricing.amount.toLocaleString("fa-IR")} تومان`}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    هر {plan.pricing.periodDays.toLocaleString("fa-IR")} روز
                  </p>
                  <ul className="my-7 flex-1 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature}>✓ {feature}</li>
                    ))}
                  </ul>
                  <Link
                    className="rounded-2xl bg-accent px-5 py-3 text-center font-semibold text-accent-foreground"
                    href="/for-clubs"
                  >
                    بررسی برای باشگاه من
                  </Link>
                </article>
              ))}
            </section>
          ) : (
            <section className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-surface p-8 text-center">
              <h2 className="text-2xl font-bold">پذیرش پایلوت محدود</h2>
              <p className="mt-4 leading-8 text-muted">
                هنوز پلن عمومی منتشر نشده است؛ تا انتشار کاتالوگ، قیمت اختصاصی
                بدون عدد ساختگی و پس از مشخص‌شدن تعداد شعب و اعضای فعال ارائه
                می‌شود.
              </p>
              <Link
                className="mt-6 inline-block rounded-2xl border border-border px-5 py-3 font-semibold"
                href="/for-clubs"
              >
                مشاهده دامنه امکانات
              </Link>
            </section>
          )}
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
