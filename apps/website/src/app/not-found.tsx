import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-5 px-6 text-center">
      <p aria-hidden="true" className="text-7xl font-bold text-primary">
        ۴۰۴
      </p>
      <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
      <p className="max-w-xl text-base text-muted">{t("description")}</p>
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-medium bg-primary px-6 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        href="/"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
