"use client";

import { useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import {
  COACH_LEAD_STAGES,
  type CoachLeadStage,
} from "../../lib/coach-leads-data";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
  updatingId = null,
  onChangeStage,
}: CoachLeadsScreenProps) {
  const t = useTranslations("CoachLeads");
  const router = useRouter();
  const [filter, setFilter] = useState<LeadFilter>("all");

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
                    {COACH_LEAD_STAGES.filter((stage) => stage !== lead.stage).map(
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
