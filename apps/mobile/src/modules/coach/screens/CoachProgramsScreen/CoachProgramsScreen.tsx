"use client";

import { useMemo, useState } from "react";
import { Button, Chip, Typography } from "@heroui/react";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Clock } from "@repo/icons/Clock";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { CoachProgramState } from "../../lib/coach-programs-data";
import { coachProgramsScreenStyles as styles } from "./CoachProgramsScreen.styles";
import type { CoachProgramsScreenProps } from "./CoachProgramsScreen.types";

type ProgramFilter = "all" | CoachProgramState;

const FILTERS: ProgramFilter[] = ["all", "published", "draft", "archived"];

const FILTER_LABEL_KEY: Record<ProgramFilter, string> = {
  all: "filterAll",
  published: "filterPublished",
  draft: "filterDraft",
  archived: "filterArchived",
};

const STATE_CHIP_COLOR: Record<
  CoachProgramState,
  "success" | "warning" | "default"
> = {
  published: "success",
  draft: "warning",
  archived: "default",
};

const STATE_LABEL_KEY: Record<CoachProgramState, string> = {
  published: "statePublished",
  draft: "stateDraft",
  archived: "stateArchived",
};

export function CoachProgramsScreen({ programs }: CoachProgramsScreenProps) {
  const t = useTranslations("CoachPrograms");
  const router = useRouter();
  const [filter, setFilter] = useState<ProgramFilter>("all");

  const visiblePrograms = useMemo(
    () =>
      filter === "all"
        ? programs
        : programs.filter((program) => program.state === filter),
    [filter, programs],
  );

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
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <CallToActionCard
          actionLabel={t("createAction")}
          actionType="plus"
          onAction={() => undefined}
          subtitle={t("createSubtitle")}
          title={t("createTitle")}
          variant="primary"
        />

        <FilterChipBar aria-label={t("filtersLabel")}>
          {FILTERS.map((item) => (
            <FilterChip
              key={item}
              onPress={() => setFilter(item)}
              selected={filter === item}
            >
              {t(FILTER_LABEL_KEY[item])}
            </FilterChip>
          ))}
        </FilterChipBar>

        {visiblePrograms.length > 0 ? (
          <div className={styles.list}>
            {visiblePrograms.map((program) => (
              <article className={styles.card} key={program.id}>
                <div className={styles.cardTop}>
                  <Typography
                    className={styles.cardTitle}
                    type="body"
                    weight="semibold"
                  >
                    {program.title}
                  </Typography>
                  <Chip
                    color={STATE_CHIP_COLOR[program.state]}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>{t(STATE_LABEL_KEY[program.state])}</Chip.Label>
                  </Chip>
                </div>
                <Typography className={styles.cardFocus} type="body-sm">
                  {program.focusLabel}
                </Typography>
                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <Calendar1 aria-hidden className={styles.metaIcon} size={16} />
                    <Typography type="body-sm">
                      {t("metaWeeks", { weeks: program.weeks })}
                    </Typography>
                  </span>
                  <span className={styles.metaItem}>
                    <Clock aria-hidden className={styles.metaIcon} size={16} />
                    <Typography type="body-sm">
                      {t("metaSessions", { sessions: program.sessionsPerWeek })}
                    </Typography>
                  </span>
                  <span className={styles.metaItem}>
                    <UsersTwo aria-hidden className={styles.metaIcon} size={16} />
                    <Typography type="body-sm">
                      {t("metaAssigned", { count: program.assignedCount })}
                    </Typography>
                  </span>
                </div>
                <Typography className={styles.updated} type="body-sm">
                  {program.updatedLabel}
                </Typography>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Typography
              className={styles.emptyTitle}
              type="h4"
              weight="semibold"
            >
              {t("emptyTitle")}
            </Typography>
            <Typography className={styles.emptyBody} type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
