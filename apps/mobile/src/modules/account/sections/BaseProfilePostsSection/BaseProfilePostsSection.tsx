import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import { useTranslations } from "next-intl";
import { baseProfilePostsSectionVariants } from "./BaseProfilePostsSection.styles";
import type { BaseProfilePostsSectionProps } from "./BaseProfilePostsSection.types";

export function BaseProfilePostsSection({
  onCreatePost,
  className,
}: BaseProfilePostsSectionProps) {
  const t = useTranslations("Mobile.Profile");
  const styles = baseProfilePostsSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.body()}>
        <Typography className={styles.title()} type="body" weight="bold">
          {t("postsEmptyTitle")}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {t("postsEmptyHint")}
        </Typography>
      </div>
      <div className={styles.footer()}>
        <Button
          className={styles.createPost()}
          onPress={onCreatePost}
          variant="ghost"
         size="lg">
          {t("createPost")}
          <Plus size={16} />
        </Button>
      </div>
    </section>
  );
}
