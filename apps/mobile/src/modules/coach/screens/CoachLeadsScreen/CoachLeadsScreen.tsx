"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import {
  COACH_LEAD_STAGES,
  type CoachLeadStage,
} from "../../lib/coach-leads-data";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";
import {
  isIranPhoneInput,
  normalizeIranPhoneInput,
} from "@/modules/auth/lib/phone";
import { z } from "zod";

import { coachLeadsScreenStyles as styles } from "./CoachLeadsScreen.styles";
import type { CoachLeadsScreenProps } from "./CoachLeadsScreen.types";

type LeadFilter = "all" | CoachLeadStage;

const STAGE_CHIP_COLOR: Record<
  CoachLeadStage,
  "success" | "warning" | "danger" | "default" | "accent"
> = {
  new: "accent",
  contacted: "warning",
  trial: "default",
  converted: "success",
  lost: "danger",
};

const STAGE_LABEL_KEY: Record<CoachLeadStage, string> = {
  new: "stageNew",
  contacted: "stageContacted",
  trial: "stageTrial",
  converted: "stageConverted",
  lost: "stageLost",
};

export function CoachLeadsScreen({
  leads,
  error = null,
  creating = false,
  onCreate,
  updatingId = null,
  onChangeStage,
}: CoachLeadsScreenProps) {
  const t = useTranslations("CoachLeads");
  const router = useRouter();
  const [filter, setFilter] = useState<LeadFilter>("all");
  const createSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t("validation.nameRequired")).max(120),
        phone: z
          .string()
          .trim()
          .max(20)
          .refine(
            (value) => !value || isIranPhoneInput(value),
            t("validation.phoneInvalid"),
          ),
        source: z.string().trim().max(120),
        notes: z.string().trim().max(4000),
      }),
    [t],
  );
  type CreateLeadValues = z.infer<typeof createSchema>;
  const form = useForm<CreateLeadValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", phone: "", source: "", notes: "" },
  });
  const submitLead = form.handleSubmit(async (values) => {
    if (!onCreate) return;
    await onCreate({
      name: values.name.trim(),
      phone: values.phone
        ? normalizeIranPhoneInput(values.phone) ?? values.phone.trim()
        : undefined,
      source: values.source.trim() || undefined,
      notes: values.notes.trim() || undefined,
    });
    form.reset();
  });

  const visibleLeads = useMemo(
    () =>
      filter === "all"
        ? leads
        : leads.filter((lead) => lead.stage === filter),
    [filter, leads],
  );

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
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
            {t("subtitle")}
          </Typography>
        </section>

        {onCreate ? (
          <form
            className="flex flex-col gap-3 rounded-large border border-default-200 bg-content1 p-4"
            noValidate
            onSubmit={submitLead}
          >
            <Typography type="body" weight="semibold">
              {t("createTitle")}
            </Typography>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField isInvalid={fieldState.invalid}>
                  <Label>{t("nameLabel")}</Label>
                  <Input {...field} autoComplete="name" />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <TextField isInvalid={fieldState.invalid}>
                  <Label>{t("phoneLabel")}</Label>
                  <Input
                    {...field}
                    autoComplete="tel"
                    dir="ltr"
                    inputMode="tel"
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
            <Controller
              control={form.control}
              name="source"
              render={({ field, fieldState }) => (
                <TextField isInvalid={fieldState.invalid}>
                  <Label>{t("sourceLabel")}</Label>
                  <Input {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
            <Controller
              control={form.control}
              name="notes"
              render={({ field, fieldState }) => (
                <TextField isInvalid={fieldState.invalid}>
                  <Label>{t("notesLabel")}</Label>
                  <TextArea {...field} rows={3} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
            <Button isPending={creating} type="submit" variant="primary">
              {creating ? t("creating") : t("create")}
            </Button>
          </form>
        ) : null}

        {error ? (
          <div className="rounded-large bg-danger-50 p-3 text-danger" role="alert">
            {error}
          </div>
        ) : null}

        <FilterChipBar aria-label={t("filtersLabel")}>
          <FilterChip
            onPress={() => setFilter("all")}
            selected={filter === "all"}
          >
            {t("filterAll")}
          </FilterChip>
          {COACH_LEAD_STAGES.map((stage) => (
            <FilterChip
              key={stage}
              onPress={() => setFilter(stage)}
              selected={filter === stage}
            >
              {t(STAGE_LABEL_KEY[stage])}
            </FilterChip>
          ))}
        </FilterChipBar>

        {visibleLeads.length > 0 ? (
          <div className={styles.list}>
            {visibleLeads.map((lead) => (
              <article className={styles.card} key={lead.id}>
                <div className={styles.cardTop}>
                  <Typography type="body" weight="semibold">
                    {lead.name}
                  </Typography>
                  <Chip
                    color={STAGE_CHIP_COLOR[lead.stage]}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>{t(STAGE_LABEL_KEY[lead.stage])}</Chip.Label>
                  </Chip>
                </div>
                <Typography className={styles.cardMeta} type="body-sm">
                  {lead.phoneLabel} · {lead.sourceLabel}
                </Typography>
                <Typography className={styles.cardMeta} type="body-sm">
                  {lead.note}
                </Typography>
                <Typography className={styles.cardMeta} type="body-sm">
                  {lead.updatedLabel}
                </Typography>
                {onChangeStage ? (
                  <div className={styles.stageActions}>
                    {COACH_LEAD_STAGES.filter(
                      (stage) =>
                        stage !== lead.stage &&
                        (stage !== "converted" || Boolean(lead.athleteUserId)),
                    ).map(
                      (stage) => (
                        <Button
                          key={stage}
                          isDisabled={updatingId === lead.id}
                          onPress={() => {
                            void Promise.resolve(
                              onChangeStage(lead.id, stage),
                            );
                          }}
                          size="sm"
                          variant="ghost"
                        >
                          {t("moveTo", { stage: t(STAGE_LABEL_KEY[stage]) })}
                        </Button>
                      ),
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Typography type="h4" weight="semibold">
              {t("emptyTitle")}
            </Typography>
            <Typography className="text-muted" type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
