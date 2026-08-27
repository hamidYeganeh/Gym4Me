import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { JsonLd } from "@/shared/components/JsonLd";
import { discoveryCoaches } from "@/shared/lib/api";
import { seoCoachesListScreenVariants as styles } from "./SeoCoachesListScreen.styles";
import type { SeoCoachesListScreenProps } from "./SeoCoachesListScreen.types";

export async function SeoCoachesListScreen({
  q = "",
}: SeoCoachesListScreenProps) {
  const slots = styles();
  const coachTypeLabel = await getTranslations("Catalog.coachTypes");
  let coaches: Awaited<ReturnType<typeof discoveryCoaches.list>>["result"] = [];

  try {
    const page = await discoveryCoaches.list({
      q: q || undefined,
      page_size: 100,
    });
    coaches = page.result;
  } catch {
    coaches = [];
  }

  return (
    <>
      <PublicSiteHeader />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "مربی‌های ورزشی تأییدشده",
          numberOfItems: coaches.length,
          itemListElement: coaches.map((coach, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: [coach.user.name.first, coach.user.name.last]
              .filter(Boolean)
              .join(" "),
            url: `/coaches/${coach.userId}`,
          })),
        }}
      />
      <main className={slots.root()}>
        <div className={slots.container()}>
          <header className={slots.header()}>
            <p className={slots.eyebrow()}>رزرو مربی</p>
            <h1 className={slots.title()}>
              مربی تأییدشده را با سابقه و محل فعالیتش انتخاب کن
            </h1>
            <p className={slots.description()}>
              تخصص، سابقه، قیمت جلسه حضوری یا آنلاین و باشگاه‌های همکار را قبل
              از ارسال درخواست ببین.
            </p>
          </header>
          <form
            className={slots.searchForm()}
            method="get"
            role="search"
          >
            <input
              className={slots.searchInput()}
              defaultValue={q}
              name="q"
              placeholder="نام یا تخصص مربی"
            />
            <button className={slots.searchButton()} type="submit">
              جست‌وجو
            </button>
          </form>
          {coaches.length ? (
            <ul className={slots.grid()}>
              {coaches.map((coach) => {
                const name =
                  [coach.user.name.first, coach.user.name.last]
                    .filter(Boolean)
                    .join(" ") || "مربی Gym4Me";
                const prices = [
                  coach.pricing.consultation.inPerson,
                  coach.pricing.consultation.remote,
                ].filter((price): price is number => price !== null);

                return (
                  <li className={slots.card()} key={coach.id}>
                    <Link
                      className={slots.cardLink()}
                      href={`/coaches/${coach.userId}`}
                    >
                      <div className={slots.cardHeader()}>
                        <h2 className={slots.cardTitle()}>
                          <TextWithBrand>{name}</TextWithBrand>
                        </h2>
                        <span className={slots.badge()}>تأییدشده</span>
                      </div>
                      <p className={slots.cardBody()}>
                        {coach.experience.headline ??
                          coach.bio ??
                          coach.coachTypes
                            .map((type) => coachTypeLabel(type))
                            .join(" · ")}
                      </p>
                      <p className={slots.cardMeta()}>
                        {coach.experience.years ?? 0} سال سابقه
                        {prices.length
                          ? ` · از ${Math.min(...prices).toLocaleString("fa-IR")} تومان`
                          : ""}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={slots.empty()}>
              برای این جست‌وجو مربی‌ای پیدا نشد.
            </p>
          )}
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
