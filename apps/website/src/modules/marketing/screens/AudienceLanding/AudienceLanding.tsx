import Link from "next/link";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/modules/discovery/components/PublicSiteHeader";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  capabilities: Array<{ title: string; description: string }>;
  outcomes: string[];
};

export function AudienceLanding({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  capabilities,
  outcomes,
}: Props) {
  return (
    <>
      <PublicSiteHeader />
      <main className="bg-background px-6 py-16 text-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-16">
          <header className="max-w-4xl space-y-6">
            <p className="text-sm font-semibold text-accent">{eyebrow}</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="max-w-3xl text-lg leading-9 text-muted">
              {description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-2xl bg-accent px-6 py-3 font-semibold text-accent-foreground"
                href={primary.href}
              >
                {primary.label}
              </Link>
              <Link
                className="rounded-2xl border border-border px-6 py-3 font-semibold"
                href={secondary.href}
              >
                {secondary.label}
              </Link>
            </div>
          </header>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">
              کارهایی که از روز اول انجام می‌شود
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item) => (
                <article
                  className="rounded-3xl border border-border bg-surface p-6"
                  key={item.title}
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-[2rem] bg-default p-8 sm:p-10">
            <h2 className="text-2xl font-bold">خروجی قابل‌اندازه‌گیری</h2>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {outcomes.map((outcome) => (
                <li className="rounded-2xl bg-surface px-5 py-4" key={outcome}>
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
