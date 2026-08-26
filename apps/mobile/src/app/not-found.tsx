import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-screen text-center">
      <p aria-hidden="true" className="text-6xl font-bold text-primary">
        ۴۰۴
      </p>
      <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="max-w-sm text-base text-muted">{t("description")}</p>
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-medium bg-primary px-5 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        href="/"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
