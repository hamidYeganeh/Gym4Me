import { Typography } from "@heroui/react/typography";
import { ArticleCard } from "@repo/ui/cards/ArticleCard";
import { useTranslations } from "next-intl";
import { formatCategoryLabel } from "@/modules/articles/lib/format-article";
import { mediaFileUrl } from "@/shared/lib/api";
import { articleDetailRelatedSectionVariants } from "./ArticleDetailRelatedSection.styles";
import type { ArticleDetailRelatedSectionProps } from "./ArticleDetailRelatedSection.types";

export function ArticleDetailRelatedSection({
  related,
  onArticlePress,
  className,
}: ArticleDetailRelatedSectionProps) {
  const t = useTranslations("Articles");
  const styles = articleDetailRelatedSectionVariants();

  if (related.length === 0) return null;

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h3" weight="bold">
        {t("relatedTitle")}
      </Typography>
      <div className={styles.scroller()}>
        {related.map((item) => (
          <div key={item.id} className={styles.card()}>
            <ArticleCard
              actionLabel={item.title}
              author={{
                name: item.author.name,
                avatarSrc: mediaFileUrl(item.author.avatarMediaId),
              }}
              category={formatCategoryLabel(item.taxonomy.category)}
              commentsLabel={String(item.engagement.commentsCount)}
              coverSrc={mediaFileUrl(item.coverMediaId)}
              excerpt={item.excerpt ?? undefined}
              likesLabel={String(item.engagement.likesCount)}
              orientation="horizontal"
              readingTimeLabel={`${item.readingTimeMinutes}m`}
              saveLabel={t("save")}
              tags={item.tags.map((tag) => ({
                key: tag,
                label: formatCategoryLabel(tag),
              }))}
              title={item.title}
              type="cover"
              viewsLabel={String(item.engagement.viewsCount)}
              onPress={() => onArticlePress(item.slug)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
