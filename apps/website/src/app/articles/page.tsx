import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ArticleAudience, ArticleKind } from "@repo/api";
import { ArticlesListScreen } from "@/modules/articles/screens/ArticlesListScreen";
import {
  ARTICLE_AUDIENCES,
  ARTICLE_KINDS,
} from "@/modules/articles/lib/format-article";
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

function parseKind(value?: string): ArticleKind | undefined {
  if (!value) return undefined;
  return ARTICLE_KINDS.includes(value as ArticleKind)
    ? (value as ArticleKind)
    : undefined;
}

function parseAudience(value?: string): ArticleAudience | undefined {
  if (!value) return undefined;
  return ARTICLE_AUDIENCES.includes(value as ArticleAudience)
    ? (value as ArticleAudience)
    : undefined;
}

export default async function ArticlesIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const kind = parseKind(params.kind);
  const category = params.category?.trim().toLowerCase() || undefined;
  const audience = parseAudience(params.audience);

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
