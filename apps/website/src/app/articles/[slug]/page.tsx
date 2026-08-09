import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailScreen } from "@/modules/articles/screens/ArticleDetailScreen";
import { JsonLd } from "@/shared/components/JsonLd";
import { articlesApi, mediaFileUrl } from "@/shared/lib/api";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await articlesApi.getBySlug(slug);
    const title = article.seo.title || article.title;
    const description =
      article.seo.description || article.excerpt || undefined;
    const image = mediaFileUrl(article.coverMediaId) ?? undefined;
    return {
      title: `${title} | Gym4Me`,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    return { title: "مقالات | Gym4Me" };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  try {
    const [article, related] = await Promise.all([
      articlesApi.getBySlug(slug),
      articlesApi.listRelated(slug).catch(() => []),
    ]);
    const coverUrl = mediaFileUrl(article.coverMediaId);

    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt ?? article.seo.description ?? undefined,
            image: coverUrl ?? undefined,
            datePublished: article.publishedAt ?? undefined,
            dateModified: article.updatedAt,
            author: {
              "@type": "Person",
              name: article.author.name,
            },
            url: `/articles/${article.slug}`,
          }}
        />
        <ArticleDetailScreen
          article={article}
          coverUrl={coverUrl}
          related={related}
        />
      </>
    );
  } catch {
    notFound();
  }
}
