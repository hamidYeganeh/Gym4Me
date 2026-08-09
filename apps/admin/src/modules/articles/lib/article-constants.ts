import type {
  ArticleAudience,
  ArticleKind,
  PublishStatus,
} from "@repo/api";

export const PUBLISH_STATUSES: PublishStatus[] = [
  "draft",
  "published",
  "unpublished",
];

export const ARTICLE_KINDS: ArticleKind[] = [
  "guide",
  "news",
  "tip",
  "story",
  "workout",
];

export const ARTICLE_AUDIENCES: ArticleAudience[] = [
  "all",
  "athlete",
  "coach",
  "club_owner",
];
