"use client";

import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { coachClientDetailNotesSectionVariants } from "./CoachClientDetailNotesSection.styles";
import type { CoachClientDetailNotesSectionProps } from "./CoachClientDetailNotesSection.types";

export function CoachClientDetailNotesSection({
  note,
}: CoachClientDetailNotesSectionProps) {
  const t = useTranslations("CoachClientDetail");
  const styles = coachClientDetailNotesSectionVariants();

  return (
    <section className={styles.root()}>
      <Typography className={styles.title()} type="h4" weight="semibold">
        {t("notesTitle")}
      </Typography>
      <div className={styles.noteCard()}>
        <Typography className={styles.noteBody()} type="body-sm">
          {note}
        </Typography>
      </div>
    </section>
  );
}
