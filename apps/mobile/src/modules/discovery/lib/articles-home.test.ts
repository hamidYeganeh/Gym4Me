import { describe, expect, it } from "@jest/globals";
import type { ArticleSummary } from "@repo/api";
import {
  articleHomeHref,
  formatArticleJalaliDate,
  mapArticleToEditorialHomeItem,
} from "./articles-home";

function article(overrides: Partial<ArticleSummary> = {}): ArticleSummary {
  return {
    id: "art-1",
    title: "علم تمرین مؤثر",
    slug: "train-smarter",
    excerpt: null,
    taxonomy: { category: "fitness", kind: "workout", audience: "all" },
    coverMediaId: null,
    publishedAt: "2025-06-25T10:00:00.000Z",
    readingTimeMinutes: 5,
    tags: [],
    engagement: {
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
    },
    author: { id: "a1", name: "مای ساکوراجیما", avatarMediaId: null },
    seo: { title: null, description: null },
    createdAt: "2025-06-25T10:00:00.000Z",
    updatedAt: "2025-06-25T10:00:00.000Z",
    ...overrides,
  };
}

describe("articles-home", () => {
  it("builds a detail href from the article slug", () => {
    expect(articleHomeHref("train-smarter")).toBe(
      "/articles/detail?slug=train-smarter",
    );
  });

  it("formats a jalali date with a weekday comma", () => {
    const label = formatArticleJalaliDate("2025-06-25T10:00:00.000Z");
    expect(label).toMatch(/،/);
    expect(label.length).toBeGreaterThan(6);
  });

  it("maps a published article for the home rail", () => {
    const item = mapArticleToEditorialHomeItem(article());
    expect(item).toMatchObject({
      id: "art-1",
      slug: "train-smarter",
      title: "علم تمرین مؤثر",
      kind: "workout",
      authorName: "مای ساکوراجیما",
      readingTimeMinutes: 5,
    });
    expect(item.publishedAtLabel).toMatch(/،/);
  });
});
