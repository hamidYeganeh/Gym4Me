import type { ArticleSummary } from "@repo/api";

export type ArticleDetailRelatedSectionProps = {
  related: ArticleSummary[];
  onArticlePress: (slug: string) => void;
  className?: string;
};
