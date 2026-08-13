import { z } from "zod";
import type { AdminArticle, ArticleAudience, ArticleKind, PublishStatus } from "@repo/api";
import {
  ARTICLE_AUDIENCES,
  ARTICLE_KINDS,
  PUBLISH_STATUSES,
} from "../../lib/article-constants";

export type ArticlesFormMessages = {
  required: string;
};

const kindSchema = z.custom<ArticleKind>((value) =>
  typeof value === "string" && (ARTICLE_KINDS as string[]).includes(value),
);
const audienceSchema = z.custom<ArticleAudience>((value) =>
  typeof value === "string" && (ARTICLE_AUDIENCES as string[]).includes(value),
);
const publishStatusSchema = z.custom<PublishStatus>(
  (value) =>
    typeof value === "string" && (PUBLISH_STATUSES as string[]).includes(value),
);

export function createArticlesFormSchema(messages: ArticlesFormMessages) {
  return z.object({
    title: z.string().trim().min(3, messages.required),
    slug: z.string(),
    category: z.string().trim().min(2, messages.required),
    kind: kindSchema,
    audience: audienceSchema,
    excerpt: z.string(),
    body: z.string().trim().min(1, messages.required),
    coverMediaId: z.string().nullable(),
    publishStatus: publishStatusSchema,
    tags: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
  });
}

export type ArticlesFormValues = z.infer<
  ReturnType<typeof createArticlesFormSchema>
>;

export const articlesFormDefaults: ArticlesFormValues = {
  title: "",
  slug: "",
  category: "",
  kind: "guide",
  audience: "all",
  excerpt: "",
  body: "",
  coverMediaId: null,
  publishStatus: "draft",
  tags: "",
  seoTitle: "",
  seoDescription: "",
};

export function parseTags(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function articleToFormValues(article: AdminArticle): ArticlesFormValues {
  return {
    title: article.title,
    slug: article.slug,
    category: article.taxonomy.category,
    kind: article.taxonomy.kind,
    audience: article.taxonomy.audience,
    excerpt: article.excerpt ?? "",
    body: article.body,
    coverMediaId: article.coverMediaId,
    publishStatus: article.publishStatus,
    tags: article.tags.join(", "),
    seoTitle: article.seo.title ?? "",
    seoDescription: article.seo.description ?? "",
  };
}
