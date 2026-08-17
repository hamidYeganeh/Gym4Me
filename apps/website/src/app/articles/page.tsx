import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArticlesListScreen } from "@/modules/articles/screens/ArticlesListScreen";
import {
  parseArticleAudience,
  parseArticleKind,
} from "@/modules/articles";
import { articlesApi } from "@/shared/lib/api";

type Props = {
  searchParams: Promise<{
    kind?: string;
    category?: string;
    audience?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Articles");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ArticlesIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const kind = parseArticleKind(params.kind);
  const category = params.category?.trim().toLowerCase() || undefined;
  const audience = parseArticleAudience(params.audience);

  let posts: Awaited<ReturnType<typeof articlesApi.list>>["result"] = [];
  let facets: Awaited<ReturnType<typeof articlesApi.facets>> = {
    categories: [],
    kinds: [],
    audiences: [],
  };

  try {
    const [page, nextFacets] = await Promise.all([
      articlesApi.list({
        page_size: 50,
        kind,
        category,
        audience,
      }),
      articlesApi.facets(),
    ]);
    posts = page.result;
    facets = nextFacets;
  } catch {
    posts = [];
  }

  return (
    <ArticlesListScreen
      activeAudience={audience ?? "any"}
      activeCategory={category ?? "all"}
      activeKind={kind ?? "all"}
      facets={facets}
      posts={posts}
    />
  );
}
