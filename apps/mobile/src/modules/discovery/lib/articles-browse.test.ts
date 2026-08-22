import { describe, expect, it } from "@jest/globals";
import type { ArticleSummary } from "@repo/api";
import {
  appendUniqueArticles,
  articlesBrowseHref,
  mapArticleToBrowseItem,
  nextArticlePage,
  resolveArticleKindParam,
} from "./articles-browse";

function article(overrides: Partial<ArticleSummary> = {}): ArticleSummary {
  return {
    id: "art-1",
    title: "علم تمرین مؤثر",
    slug: "train-smarter",
    excerpt: "شروع هوشمند",
    taxonomy: { category: "fitness", kind: "workout", audience: "all" },
    coverMediaId: "cover-1",
    publishedAt: "2025-06-25T10:00:00.000Z",
    readingTimeMinutes: 5,
    tags: [],
    engagement: {
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
    },
    author: { id: "a1", name: "مای ساکوراجیما", avatarMediaId: "av-1" },
    seo: { title: null, description: null },
    createdAt: "2025-06-25T10:00:00.000Z",
    updatedAt: "2025-06-25T10:00:00.000Z",
    ...overrides,
  };
}

describe("articles-browse", () => {
  it("builds browse hrefs from the kind filter", () => {
    expect(articlesBrowseHref()).toBe("/discovery/articles");
    expect(articlesBrowseHref("all")).toBe("/discovery/articles");
    expect(articlesBrowseHref("guide")).toBe("/discovery/articles?kind=guide");
  });

  it("accepts known kinds and falls back to all", () => {
    expect(resolveArticleKindParam("tip")).toBe("tip");
    expect(resolveArticleKindParam("unknown")).toBe("all");
    expect(resolveArticleKindParam(null)).toBe("all");
  });

  it("reads the next page from pagination meta", () => {
    expect(nextArticlePage({ next: 3 })).toBe(3);
    expect(nextArticlePage({ next: null })).toBeNull();
    expect(nextArticlePage(undefined)).toBeNull();
  });

  it("appends incoming articles without duplicating ids", () => {
    const first = mapArticleToBrowseItem(article(), null, null);
    const second = mapArticleToBrowseItem(
      article({ id: "art-2", slug: "sleep" }),
      null,
      null,
    );
    const merged = appendUniqueArticles([first], [first, second]);
    expect(merged.map((item) => item.id)).toEqual(["art-1", "art-2"]);
  });

  it("maps a published article for the browse list", () => {
    const item = mapArticleToBrowseItem(
      article(),
      "/media/cover-1",
      "/media/av-1",
    );
    expect(item).toMatchObject({
      id: "art-1",
      slug: "train-smarter",
      kind: "workout",
      coverSrc: "/media/cover-1",
      authorAvatarSrc: "/media/av-1",
      href: "/articles/detail?slug=train-smarter",
    });
    expect(item.publishedAtLabel).toMatch(/،/);
  });
});
