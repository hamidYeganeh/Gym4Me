import { Button } from "@heroui/react";
import { Bookmark } from "@repo/icons/Bookmark";
import { Chat } from "@repo/icons/Chat";
import { Heart } from "@repo/icons/Heart";
import { useTranslations } from "next-intl";
import { articleDetailEngagementSectionVariants } from "./ArticleDetailEngagementSection.styles";
import type { ArticleDetailEngagementSectionProps } from "./ArticleDetailEngagementSection.types";

export function ArticleDetailEngagementSection({
  article,
  liked,
  saved,
  actionPending,
  onToggleLike,
  onToggleSave,
  className,
}: ArticleDetailEngagementSectionProps) {
  const t = useTranslations("Articles");
  const styles = articleDetailEngagementSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <Button
        aria-label={liked ? t("unlike") : t("like")}
        aria-pressed={liked}
        className={styles.actionButton({
          className: liked ? styles.actionActive() : undefined,
        })}
        isDisabled={actionPending}
        variant="secondary"
        onPress={onToggleLike}
      >
        <Heart size={18} />
        {article.engagement.likesCount}
      </Button>
      <Button
        aria-label={t("comments", {
          count: article.engagement.commentsCount,
        })}
        className={styles.actionButton()}
        variant="secondary"
        onPress={() => undefined}
      >
        <Chat size={18} />
        {article.engagement.commentsCount}
      </Button>
      <Button
        aria-label={saved ? t("unsave") : t("save")}
        aria-pressed={saved}
        className={styles.actionButton({
          className: saved ? styles.actionActive() : undefined,
        })}
        isDisabled={actionPending}
        variant="secondary"
        onPress={onToggleSave}
      >
        <Bookmark size={18} />
        {article.engagement.savesCount}
      </Button>
    </div>
  );
}
