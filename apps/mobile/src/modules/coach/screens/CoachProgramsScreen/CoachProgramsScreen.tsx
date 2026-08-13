"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
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

export function CoachProgramsScreen({
  programs,
  creating = false,
  createError = null,
  onCreateProgram,
  onPublishProgram,
}: CoachProgramsScreenProps) {
  const t = useTranslations("CoachPrograms");
  const router = useRouter();
  const [filter, setFilter] = useState<ProgramFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [focusLabel, setFocusLabel] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);

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
          onAction={() => {
            if (!onCreateProgram) return;
            setShowForm(true);
          }}
          subtitle={t("createSubtitle")}
          title={t("createTitle")}
          variant="primary"
        />

        {showForm && onCreateProgram ? (
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              if (!title.trim()) return;
              void Promise.resolve(
                onCreateProgram({
                  title: title.trim(),
                  focusLabel: focusLabel.trim() || undefined,
                  weekCount: 4,
                  sessionsPerWeek: 3,
                }),
              ).then(() => {
                setTitle("");
                setFocusLabel("");
                setShowForm(false);
              });
            }}
          >
            <TextField>
              <Label>{t("createTitleLabel")}</Label>
              <Input
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t("createTitlePlaceholder")}
                value={title}
              />
            </TextField>
            <TextField>
              <Label>{t("createFocusLabel")}</Label>
              <Input
                onChange={(event) => setFocusLabel(event.target.value)}
                placeholder={t("createFocusPlaceholder")}
                value={focusLabel}
              />
            </TextField>
            {createError ? (
              <Typography className="text-danger" type="body-sm">
                {t("createError")}
              </Typography>
            ) : null}
            <div className={styles.formActions}>
              <Button
                isDisabled={creating}
                onPress={() => setShowForm(false)}
                variant="ghost"
              >
                {t("createCancel")}
              </Button>
              <Button
                isDisabled={creating || !title.trim()}
                type="submit"
                variant="primary"
              >
                {creating ? t("creating") : t("createSubmit")}
              </Button>
            </div>
          </form>
        ) : null}

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
                {program.state === "draft" && onPublishProgram ? (
                  <Button
                    fullWidth
                    isDisabled={publishingId === program.id}
                    onPress={() => {
                      setPublishingId(program.id);
                      void Promise.resolve(onPublishProgram(program.id)).finally(
                        () => setPublishingId(null),
                      );
                    }}
                    variant="secondary"
                  >
                    {publishingId === program.id
                      ? t("publishing")
                      : t("publishAction")}
                  </Button>
                ) : null}
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
