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
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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

export function CoachClientsScreen({ clients }: CoachClientsScreenProps) {
  const t = useTranslations("CoachClients");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<EngagementFilter>("all");

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
        <Header
          className="border-b-0 bg-background"
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
                  <img
                    alt={client.name}
                    className={styles.avatar}
                    src={client.avatar}
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
