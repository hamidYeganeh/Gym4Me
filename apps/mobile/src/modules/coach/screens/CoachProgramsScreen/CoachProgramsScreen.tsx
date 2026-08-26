"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { CoachProgramsCreateFormSection } from "../../sections/CoachProgramsCreateFormSection";
import { CoachProgramsFiltersSection } from "../../sections/CoachProgramsFiltersSection";
import type { ProgramFilter } from "../../sections/CoachProgramsFiltersSection";
import { CoachProgramsIntroSection } from "../../sections/CoachProgramsIntroSection";
import { CoachProgramsListSection } from "../../sections/CoachProgramsListSection";
import { coachProgramsScreenVariants } from "./CoachProgramsScreen.styles";
import type { CoachProgramsScreenProps } from "./CoachProgramsScreen.types";

export function CoachProgramsScreen({
  programs,
  creating = false,
  createError = null,
  onCreateProgram,
  onPublishProgram,
}: CoachProgramsScreenProps) {
  const t = useTranslations("CoachPrograms");
  const router = useRouter();
  const styles = coachProgramsScreenVariants();
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
      className={styles.root()}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content()}>
        <CoachProgramsIntroSection
          canCreate={Boolean(onCreateProgram)}
          onCreatePress={() => setShowForm(true)}
        />

        {showForm && onCreateProgram ? (
          <CoachProgramsCreateFormSection
            createError={createError}
            creating={creating}
            focusLabel={focusLabel}
            title={title}
            onCancel={() => setShowForm(false)}
            onFocusLabelChange={setFocusLabel}
            onSubmit={() => {
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
            onTitleChange={setTitle}
          />
        ) : null}

        <CoachProgramsFiltersSection
          filter={filter}
          onFilterChange={setFilter}
        />

        <CoachProgramsListSection
          programs={visiblePrograms}
          publishingId={publishingId}
          onProgramPress={(programId) =>
            router.push(`/coach/programs/${programId}`)
          }
          onPublishProgram={
            onPublishProgram
              ? (programId) => {
                  setPublishingId(programId);
                  return Promise.resolve(onPublishProgram(programId)).finally(
                    () => setPublishingId(null),
                  );
                }
              : undefined
          }
        />
      </div>
    </AppLayout>
  );
}
