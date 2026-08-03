"use client";

import { Button, Chip, Surface, Typography } from "@heroui/react";
import { Check } from "@repo/icons/Check";
import { Plus } from "@repo/icons/Plus";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { discoveryCoachesDetailProgramsSectionStyles as styles } from "./DiscoveryCoachesDetailProgramsSection.styles";
import type { DiscoveryCoachesDetailProgramsSectionProps } from "./DiscoveryCoachesDetailProgramsSection.types";

export function DiscoveryCoachesDetailProgramsSection({
  programs,
  onToggleDone,
  onAddProgram,
}: DiscoveryCoachesDetailProgramsSectionProps) {
  const t = useTranslations("CoachDetail");

  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Typography className={styles.title} type="h3" weight="bold">
            {t("programsTitle")}
          </Typography>
          <Typography className={styles.count} color="muted" type="body-sm">
            {t("programsCount", { count: programs.length })}
          </Typography>
        </div>
        <Button
          aria-label={t("addProgram")}
          className={styles.addButton}
          isIconOnly
          onPress={onAddProgram}
          size="lg"
          variant="ghost"
        >
          <Plus size={20} />
        </Button>
      </div>

      <ul className={styles.list}>
        {programs.map((program) => {
          const statusLabel =
            program.status === "thinking"
              ? t("statusThinking")
              : program.status === "inProgress"
                ? t("statusInProgress")
                : null;

          return (
            <li key={program.id}>
              <Surface className={styles.card} variant="secondary">
                <div className={styles.thumbWrap}>
                  <Image
                    alt=""
                    className={styles.thumb}
                    fill
                    sizes="48px"
                    src={program.image || PLACEHOLDER_IMAGE}
                  />
                </div>

                <div className={styles.body}>
                  <Typography
                    className={styles.cardTitle}
                    type="body"
                    weight="semibold"
                  >
                    {program.title}
                  </Typography>
                  <Typography
                    className={styles.cardSubtitle}
                    color="muted"
                    type="body-sm"
                  >
                    {program.subtitle}
                  </Typography>
                </div>

                <div className={styles.trailing}>
                  {statusLabel ? (
                    <Chip
                      className={styles.statusChip}
                      color={
                        program.status === "thinking" ? "warning" : "default"
                      }
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>{statusLabel}</Chip.Label>
                    </Chip>
                  ) : null}

                  <Button
                    aria-label={program.done ? t("markUndone") : t("markDone")}
                    aria-pressed={program.done}
                    className={styles.checkButton}
                    isIconOnly
                    onPress={() => onToggleDone?.(program.id)}
                    size="lg"
                    variant={program.done ? "primary" : "outline"}
                  >
                    {program.done ? <Check size={16} /> : null}
                  </Button>
                </div>
              </Surface>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
