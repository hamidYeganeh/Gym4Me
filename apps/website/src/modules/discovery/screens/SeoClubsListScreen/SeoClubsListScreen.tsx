import Link from "next/link";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { JsonLd } from "@/shared/components/JsonLd";
import { discoveryClubs } from "@/shared/lib/api";
import { seoClubsListScreenVariants as styles } from "./SeoClubsListScreen.styles";
import type { SeoClubsListScreenProps } from "./SeoClubsListScreen.types";

export async function SeoClubsListScreen({ q = "" }: SeoClubsListScreenProps) {
  const slots = styles();
  let clubs: Awaited<ReturnType<typeof discoveryClubs.list>>["result"] = [];

  try {
    const page = await discoveryClubs.list({
      q: q || undefined,
      page_size: 100,
    });
    clubs = page.result;
  } catch {
    clubs = [];
  }

  return (
    <>
      <PublicSiteHeader />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "باشگاه‌های ورزشی Gym4Me",
          numberOfItems: clubs.length,
          itemListElement: clubs.map((club, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: club.identity.name,
            url: `/clubs/${club.id}`,
          })),
        }}
      />
      <main className={slots.root()}>
        <div className={slots.container()}>
          <header className={slots.header()}>
            <p className={slots.eyebrow()}>کشف باشگاه</p>
            <h1 className={slots.title()}>
              باشگاه مناسب خودت را با اطلاعات واقعی پیدا کن
            </h1>
            <p className={slots.description()}>
              فقط مجموعه‌های تأییدشده نمایش داده می‌شوند؛ امتیاز، امکانات،
              رشته‌ها و موقعیت را پیش از انتخاب ببینید.
            </p>
          </header>
          <form className={slots.searchForm()} method="get" role="search">
            <input
              className={slots.searchInput()}
              defaultValue={q}
              name="q"
              placeholder="نام باشگاه یا رشته ورزشی"
            />
            <button className={slots.searchButton()} type="submit">
              جست‌وجو
            </button>
          </form>
          {clubs.length ? (
            <ul className={slots.grid()}>
              {clubs.map((club) => (
                <li className={slots.card()} key={club.id}>
                  <Link className={slots.cardLink()} href={`/clubs/${club.id}`}>
                    <div className={slots.cardHeader()}>
                      <h2 className={slots.cardTitle()}>
                        {club.identity.name}
                      </h2>
                      <span className={slots.rating()}>
                        ★ {club.reviewsSummary.average.toFixed(1)}
                      </span>
                    </div>
                    <p className={slots.cardBody()}>
                      {club.location?.address ??
                        club.identity.description ??
                        "اطلاعات موقعیت در حال تکمیل است."}
                    </p>
                    <p className={slots.cardMeta()}>
                      {club.sports
                        .slice(0, 3)
                        .map((sport) => ("name" in sport ? sport.name : null))
                        .filter(Boolean)
                        .join(" · ") ||
                        `${club.reviewsSummary.count} نظر تأییدشده`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={slots.empty()}>برای این جست‌وجو باشگاهی پیدا نشد.</p>
          )}
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
