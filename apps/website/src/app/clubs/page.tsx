import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/modules/discovery/lib/JsonLd";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/modules/discovery/components/PublicSiteHeader";
import { discoveryClubs } from "@/shared/lib/api";

export const metadata: Metadata = {
  title: "فهرست باشگاه‌های تأییدشده",
  description:
    "باشگاه‌های ورزشی تأییدشده را بر اساس نام، رشته، امکانات و امتیاز پیدا و مقایسه کنید.",
  alternates: { canonical: "/clubs" },
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ClubsPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
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
      <main className="min-h-[70vh] bg-background px-6 py-14 text-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="max-w-3xl space-y-3">
            <p className="text-sm font-medium text-accent">کشف باشگاه</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              باشگاه مناسب خودت را با اطلاعات واقعی پیدا کن
            </h1>
            <p className="leading-8 text-muted">
              فقط مجموعه‌های تأییدشده نمایش داده می‌شوند؛ امتیاز، امکانات،
              رشته‌ها و موقعیت را پیش از انتخاب ببینید.
            </p>
          </header>
          <form className="flex max-w-2xl gap-2" method="get" role="search">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 py-3"
              defaultValue={q}
              name="q"
              placeholder="نام باشگاه یا رشته ورزشی"
            />
            <button className="rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-foreground">
              جست‌وجو
            </button>
          </form>
          {clubs.length ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <li
                  className="rounded-3xl border border-border bg-surface p-5"
                  key={club.id}
                >
                  <Link className="block space-y-4" href={`/clubs/${club.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold">
                        {club.identity.name}
                      </h2>
                      <span className="rounded-full bg-default px-3 py-1 text-xs">
                        ★ {club.reviewsSummary.average.toFixed(1)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-7 text-muted">
                      {club.location?.address ??
                        club.identity.description ??
                        "اطلاعات موقعیت در حال تکمیل است."}
                    </p>
                    <p className="text-xs text-muted">
                      {club.sports
                        .slice(0, 3)
                        .map((sport) => sport.name)
                        .filter(Boolean)
                        .join(" · ") ||
                        `${club.reviewsSummary.count} نظر تأییدشده`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-3xl border border-border p-8 text-muted">
              برای این جست‌وجو باشگاهی پیدا نشد.
            </p>
          )}
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
