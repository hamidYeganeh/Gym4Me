import type { Article } from "@repo/api";

export type ArticleDetailEngagementSectionProps = {
  article: Article;
  liked: boolean;
  saved: boolean;
  actionPending: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  className?: string;
};
