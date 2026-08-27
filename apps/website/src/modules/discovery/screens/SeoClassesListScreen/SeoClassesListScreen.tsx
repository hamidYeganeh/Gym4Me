import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { JsonLd } from "@/shared/components/JsonLd";
import { discoveryClasses } from "@/shared/lib/api";
import { seoClassesListScreenVariants as styles } from "./SeoClassesListScreen.styles";
import type { SeoClassesListScreenProps } from "./SeoClassesListScreen.types";

export async function SeoClassesListScreen({
  q = "",
}: SeoClassesListScreenProps) {
  const t = await getTranslations("PublicClasses");
  const slots = styles();
  let classes: Awaited<ReturnType<typeof discoveryClasses.list>>["result"] = [];

  try {
    const page = await discoveryClasses.list({
      q: q || undefined,
      page_size: 100,
    });
    classes = page.result;
  } catch {
    classes = [];
  }

  return (
    <>
      <PublicSiteHeader />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: t("itemListName"),
          numberOfItems: classes.length,
          itemListElement: classes.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.title,
            url: `/classes/${item.id}`,
          })),
        }}
      />
      <main className={slots.root()}>
        <div className={slots.container()}>
          <header className={slots.header()}>
            <p className={slots.eyebrow()}>{t("eyebrow")}</p>
            <h1 className={slots.title()}>{t("title")}</h1>
            <p className={slots.description()}>
              <TextWithBrand>{t("description")}</TextWithBrand>
            </p>
          </header>
          <form className={slots.searchForm()} method="get" role="search">
            <input
              aria-label={t("searchPlaceholder")}
              className={slots.searchInput()}
              defaultValue={q}
              name="q"
              placeholder={t("searchPlaceholder")}
            />
            <button className={slots.searchButton()} type="submit">
              {t("searchAction")}
            </button>
          </form>
          {classes.length ? (
            <ul className={slots.grid()}>
              {classes.map((item) => (
                <li className={slots.card()} key={item.id}>
                  <Link className={slots.cardLink()} href={`/classes/${item.id}`}>
                    <h2 className={slots.cardTitle()}>{item.title}</h2>
                    <p className={slots.cardBody()}>
                      {item.description ?? t("fallbackDescription")}
                    </p>
                    <p className={slots.cardMeta()}>
                      {t("clubLabel", { name: item.club.name })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={slots.empty()}>{t("empty")}</p>
          )}
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
