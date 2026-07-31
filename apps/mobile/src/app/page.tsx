import { Logo } from "@repo/ui/logo";
import { getTranslations } from "next-intl/server";
import { ThemeDemo } from "./theme-demo";

export default async function Home() {
  const t = await getTranslations("HomePage");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Logo size="lg" />
          <p className="text-lg font-semibold tracking-tight text-foreground">
            {t("brand")}
          </p>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="max-w-xl text-base text-muted">{t("description")}</p>
      </header>

      <ThemeDemo
        labels={{
          primaryAction: t("primaryAction"),
          secondaryAction: t("secondaryAction"),
          variantsLabel: t("variantsLabel"),
          surfacesLabel: t("surfacesLabel"),
          chipsLabel: t("chipsLabel"),
          iconsLabel: t("iconsLabel"),
          themeLight: t("themeLight"),
          themeDark: t("themeDark"),
          chipNew: t("chipNew"),
          chipSuccess: t("chipSuccess"),
          chipWarning: t("chipWarning"),
          surfacePrimary: t("surfacePrimary"),
          surfaceSecondary: t("surfaceSecondary"),
          surfaceTertiary: t("surfaceTertiary"),
        }}
      />
    </main>
  );
}
