import type { ArticleAudience, ArticleKind, PublishStatus } from "@repo/api";

export type ArticlesListHeaderSectionProps = {
  statusFilter: PublishStatus | "all";
  kindFilter: ArticleKind | "all";
  audienceFilter: ArticleAudience | "any";
  onStatusChange: (value: PublishStatus | "all") => void;
  onKindChange: (value: ArticleKind | "all") => void;
  onAudienceChange: (value: ArticleAudience | "any") => void;
  onCreate: () => void;
  onRefresh: () => void;
  className?: string;
};
