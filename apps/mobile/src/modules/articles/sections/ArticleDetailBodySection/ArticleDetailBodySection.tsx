"use client";

import { ReadingTimeCard } from "@repo/ui/cards/ReadingTimeCard";
import { useTranslations } from "next-intl";
import { articleDetailBodySectionVariants } from "./ArticleDetailBodySection.styles";
import type { ArticleDetailBodySectionProps } from "./ArticleDetailBodySection.types";

export function ArticleDetailBodySection({
  readingTimeMinutes,
  safeBody,
  className,
}: ArticleDetailBodySectionProps) {
  const t = useTranslations("Articles");
  const styles = articleDetailBodySectionVariants();

  return (
    <div className={styles.root({ className })}>
      <ReadingTimeCard
        label={t("readingTimeLabel")}
        value={t("readingTimeApprox", { minutes: readingTimeMinutes })}
      />

      <div
        className={styles.body()}
        dangerouslySetInnerHTML={{
          __html: safeBody,
        }}
      />
    </div>
  );
}
