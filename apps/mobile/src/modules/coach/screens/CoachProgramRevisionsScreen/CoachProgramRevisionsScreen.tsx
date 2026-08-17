"use client";

import { useMemo, useState } from "react";
import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { coachProgramRevisionsScreenStyles as styles } from "./CoachProgramRevisionsScreen.styles";
import type { CoachProgramRevisionsScreenProps } from "./CoachProgramRevisionsScreen.types";

export function CoachProgramRevisionsScreen({
  programTitle,
  revisions,
}: CoachProgramRevisionsScreenProps) {
  const t = useTranslations("CoachProgramRevisions");
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const diff = useMemo(() => {
    if (selectedIds.length !== 2) return null;
    const [a, b] = selectedIds.map(
      (id) => revisions.find((item) => item.id === id)!,
    );
    const newer = revisions.indexOf(a) < revisions.indexOf(b) ? a : b;
    const older = newer === a ? b : a;
    return {
      newer,
      older,
      added: newer.addedLines,
      removed: older.addedLines.filter(
        (line) => !newer.addedLines.includes(line),
      ),
    };
  }, [revisions, selectedIds]);

  function toggleRevision(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 2) {
        return [current[1]!, id];
      }
      return [...current, id];
    });
  }

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {programTitle}
          </Typography>
          <Typography className={styles.introSubtitle} type="body-sm">
            {t("subtitle")}
          </Typography>
        </section>

        <div className={styles.list}>
          {revisions.map((revision) => {
            const selected = selectedIds.includes(revision.id);
            return (
              <Button
                className={`${styles.revisionCard} ${selected ? styles.revisionSelected : ""}`}
                key={revision.id}
                variant="ghost"
                onPress={() => toggleRevision(revision.id)}
              >
                <Typography type="body" weight="semibold">
                  {revision.label}
                </Typography>
                <Typography className={styles.revisionMeta} type="body-sm">
                  {revision.createdAtLabel}
                </Typography>
              </Button>
            );
          })}
        </div>

        {diff ? (
          <section className={styles.diffCard}>
            <Typography type="h4" weight="semibold">
              {t("diffTitle", {
                from: diff.older.label,
                to: diff.newer.label,
              })}
            </Typography>
            {diff.added.length > 0 ? (
              <div className={styles.diffSection}>
                <Typography type="body-sm" weight="semibold">
                  {t("addedTitle")}
                </Typography>
                {diff.added.map((line) => (
                  <Typography className={styles.addedLine} key={line} type="body-sm">
                    + {line}
                  </Typography>
                ))}
              </div>
            ) : null}
            {diff.removed.length > 0 ? (
              <div className={styles.diffSection}>
                <Typography type="body-sm" weight="semibold">
                  {t("removedTitle")}
                </Typography>
                {diff.removed.map((line) => (
                  <Typography className={styles.removedLine} key={line} type="body-sm">
                    − {line}
                  </Typography>
                ))}
              </div>
            ) : null}
            {diff.added.length === 0 && diff.removed.length === 0 ? (
              <Typography className={styles.empty} type="body-sm">
                {t("noDiff")}
              </Typography>
            ) : null}
          </section>
        ) : (
          <Typography className={styles.empty} type="body-sm">
            {t("selectTwo")}
          </Typography>
        )}
      </div>
    </AppLayout>
  );
}
