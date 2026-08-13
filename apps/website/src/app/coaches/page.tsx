import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/modules/discovery/lib/JsonLd";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/modules/discovery/components/PublicSiteHeader";
import { discoveryCoaches } from "@/shared/lib/api";

export const metadata: Metadata = {
  title: "مربی‌های ورزشی تأییدشده",
  description:
    "مربی‌های تأییدشده را بر اساس تخصص، سابقه، نوع جلسه و باشگاه محل فعالیت مقایسه کنید.",
  alternates: { canonical: "/coaches" },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function CoachesPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
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
      <main className="min-h-[70vh] bg-background px-6 py-14 text-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="max-w-3xl space-y-3">
            <p className="text-sm font-medium text-accent">رزرو مربی</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              مربی تأییدشده را با سابقه و محل فعالیتش انتخاب کن
            </h1>
            <p className="leading-8 text-muted">
              تخصص، سابقه، قیمت جلسه حضوری یا آنلاین و باشگاه‌های همکار را قبل
              از ارسال درخواست ببینید.
            </p>
          </header>
          <form className="flex max-w-2xl gap-2" method="get" role="search">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 py-3"
              defaultValue={q}
              name="q"
              placeholder="نام یا تخصص مربی"
            />
            <button className="rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-foreground">
              جست‌وجو
            </button>
          </form>
          {coaches.length ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <li
                    className="rounded-3xl border border-border bg-surface p-5"
                    key={coach.id}
                  >
                    <Link
                      className="block space-y-4"
                      href={`/coaches/${coach.userId}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">{name}</h2>
                        <span className="rounded-full bg-success/10 px-3 py-1 text-xs text-success">
                          تأییدشده
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm leading-7 text-muted">
                        {coach.experience.headline ??
                          coach.bio ??
                          coach.specialtyKeys.join(" · ")}
                      </p>
                      <p className="text-xs text-muted">
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
            <p className="rounded-3xl border border-border p-8 text-muted">
              برای این جست‌وجو مربی‌ای پیدا نشد.
            </p>
          )}
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
