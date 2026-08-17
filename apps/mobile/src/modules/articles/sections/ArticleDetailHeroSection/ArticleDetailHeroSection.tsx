import { Avatar, Typography } from "@heroui/react";
import {
  formatArticleDate,
  formatCategoryLabel,
} from "@/modules/articles/lib/format-article";
import { mediaFileUrl } from "@/shared/lib/api";
import { articleDetailHeroSectionVariants } from "./ArticleDetailHeroSection.styles";
import type { ArticleDetailHeroSectionProps } from "./ArticleDetailHeroSection.types";

export function ArticleDetailHeroSection({
  article,
  className,
}: ArticleDetailHeroSectionProps) {
  const styles = articleDetailHeroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <span className={styles.categoryChip()}>
        {formatCategoryLabel(article.taxonomy.category)}
      </span>
      <Typography className={styles.title()} type="h1" weight="bold">
        {article.title}
      </Typography>
      <p className={styles.meta()}>
        <span>{formatArticleDate(article.publishedAt)}</span>
      </p>
      <div className={styles.authorRow()}>
        <Avatar className="size-8">
          {mediaFileUrl(article.author.avatarMediaId) ? (
            <Avatar.Image
              alt=""
              src={mediaFileUrl(article.author.avatarMediaId)!}
            />
          ) : null}
          <Avatar.Fallback>
            {article.author.name.slice(0, 1)}
          </Avatar.Fallback>
        </Avatar>
        <Typography className={styles.authorName()} type="body-sm">
          {article.author.name}
        </Typography>
      </div>
    </section>
  );
}
