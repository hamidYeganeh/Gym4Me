"use client";

import { useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "@/shared/lib/app-router";

import type { CoachClientEngagement } from "../../lib/coach-clients-data";
import { coachClientsScreenStyles as styles } from "./CoachClientsScreen.styles";
import type { CoachClientsScreenProps } from "./CoachClientsScreen.types";

type EngagementFilter = "all" | CoachClientEngagement;

const ENGAGEMENT_FILTERS: EngagementFilter[] = [
  "all",
  "active",
  "at-risk",
  "paused",
];

const ENGAGEMENT_CHIP_COLOR: Record<
  CoachClientEngagement,
  "success" | "warning" | "default"
> = {
  active: "success",
  "at-risk": "warning",
  paused: "default",
};

const FILTER_LABEL_KEY: Record<EngagementFilter, string> = {
  all: "filterAll",
  active: "filterActive",
  "at-risk": "filterAtRisk",
  paused: "filterPaused",
};

const ENGAGEMENT_LABEL_KEY: Record<CoachClientEngagement, string> = {
  active: "engagementActive",
  "at-risk": "engagementAtRisk",
  paused: "engagementPaused",
};

export function CoachClientsScreen({
  clients,
  initialFilter = "all",
  followingUpId,
  followUpError,
  onFollowUp,
}: CoachClientsScreenProps) {
  const t = useTranslations("CoachClients");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<EngagementFilter>(initialFilter);

  const filteredClients = useMemo(() => {
    const normalized = query.trim();
    return clients.filter((client) => {
      if (filter !== "all" && client.engagement !== filter) {
        return false;
      }
      if (normalized.length > 0 && !client.name.includes(normalized)) {
        return false;
      }
      return true;
    });
  }, [clients, filter, query]);

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
            {t("subtitle", { count: clients.length })}
          </Typography>
        </section>

        <TextField className={styles.search}>
          <Label>{t("searchLabel")}</Label>
          <Input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            value={query}
          />
        </TextField>

        <FilterChipBar aria-label={t("filtersLabel")}>
          {ENGAGEMENT_FILTERS.map((item) => (
            <FilterChip
              key={item}
              onPress={() => setFilter(item)}
              selected={filter === item}
            >
              {t(FILTER_LABEL_KEY[item])}
            </FilterChip>
          ))}
        </FilterChipBar>

        {initialFilter === "at-risk" ? (
          <div className={styles.followUpSummary} role="status">
            <Typography type="body" weight="semibold">
              {t("followUpTitle")}
            </Typography>
            <Typography className={styles.introSubtitle} type="body-sm">
              {t("followUpSummary", { count: filteredClients.length })}
            </Typography>
          </div>
        ) : null}

        {followUpError ? (
          <Typography className="text-danger" role="alert" type="body-sm">
            {followUpError}
          </Typography>
        ) : null}

        {filteredClients.length > 0 ? (
          <div className={styles.groupCard}>
            {filteredClients.map((client) => (
              <div key={client.id}>
                <Button
                  className={styles.row}
                  fullWidth
                  onPress={() => router.push(`/coach/clients/${client.id}`)}
                  variant="ghost"
                >
                  <Image
                    alt={client.name}
                    className={styles.avatar}
                    height={48}
                    src={client.avatar}
                    width={48}
                  />
                  <span className={styles.rowBody}>
                    <span className={styles.rowTop}>
                      <Typography
                        className={styles.rowName}
                        type="body"
                        weight="semibold"
                      >
                        {client.name}
                      </Typography>
                      <Chip
                        color={ENGAGEMENT_CHIP_COLOR[client.engagement]}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>
                          {t(ENGAGEMENT_LABEL_KEY[client.engagement])}
                        </Chip.Label>
                      </Chip>
                    </span>
                    <Typography className={styles.rowGoal} type="body-sm">
                      {client.goalLabel}
                    </Typography>
                    <span
                      aria-label={t("progressLabel", {
                        percent: client.progressPercent,
                      })}
                      className={styles.progressTrack}
                      role="img"
                    >
                      <span
                        className={styles.progressFill}
                        style={{ width: `${client.progressPercent}%` }}
                      />
                    </span>
                  </span>
                </Button>
                {client.engagement === "at-risk" && onFollowUp ? (
                  <div className={styles.followUpAction}>
                    <Button
                      isDisabled={Boolean(followingUpId)}
                      isPending={followingUpId === client.id}
                      onPress={() => onFollowUp(client)}
                      size="sm"
                      variant="secondary"
                    >
                      {t("followUpAction")}
                    </Button>
                  </div>
                ) : null}
                <div className={styles.divider} />
              </div>
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
