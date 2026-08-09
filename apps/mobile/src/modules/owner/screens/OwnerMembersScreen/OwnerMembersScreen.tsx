"use client";

import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { OwnerMembershipState } from "../../lib/owner-members-data";
import { ownerMembersScreenStyles as styles } from "./OwnerMembersScreen.styles";
import type {
  OwnerMembersFilterId,
  OwnerMembersScreenProps,
} from "./OwnerMembersScreen.types";

const STATE_CHIP_COLOR: Record<
  OwnerMembershipState,
  "success" | "warning" | "accent" | "danger"
> = {
  active: "success",
  expiring: "warning",
  frozen: "accent",
  expired: "danger",
};

const STATE_LABEL_KEY = {
  active: "stateActive",
  expiring: "stateExpiring",
  frozen: "stateFrozen",
  expired: "stateExpired",
} as const;

const FILTERS = [
  { id: "all", labelKey: "filterAll" },
  { id: "active", labelKey: "filterActive" },
  { id: "expiring", labelKey: "filterExpiring" },
  { id: "frozen", labelKey: "filterFrozen" },
  { id: "expired", labelKey: "filterExpired" },
] as const satisfies readonly {
  id: OwnerMembersFilterId;
  labelKey: string;
}[];

export function OwnerMembersScreen({
  members,
  stats,
  className,
}: OwnerMembersScreenProps) {
  const t = useTranslations("OwnerMembers");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<OwnerMembersFilterId>("all");
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(
    () => new Set(),
  );

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim();

    return members.filter((member) => {
      if (activeFilter !== "all" && member.membershipState !== activeFilter) {
        return false;
      }
      if (normalizedQuery && !member.name.includes(normalizedQuery)) {
        return false;
      }
      return true;
    });
  }, [members, query, activeFilter]);

  const toggleCheckIn = (memberId: string) => {
    setCheckedInIds((previous) => {
      const next = new Set(previous);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
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
          <Typography className={styles.introCount} type="body-sm">
            {t("totalCount", { count: members.length })}
          </Typography>
        </section>

        <div className={styles.statsGrid}>
          <StatsCard
            chart="line"
            color={stats.activeColor}
            comparisonSeries={stats.activeComparisonSeries}
            series={stats.activeSeries}
            title={t("statActiveTitle")}
            unit={t("statActiveUnit")}
            value={stats.activeValue}
          />
          <StatsCard
            chart="bar"
            color={stats.weekColor}
            series={stats.weekSeries}
            title={t("statWeekTitle")}
            unit={t("statWeekUnit")}
            value={stats.weekValue}
          />
        </div>

        <TextField className={styles.search}>
          <Label>{t("searchLabel")}</Label>
          <Input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            value={query}
          />
        </TextField>

        <FilterChipBar aria-label={t("filtersLabel")}>
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              selected={activeFilter === filter.id}
            >
              {t(filter.labelKey)}
            </FilterChip>
          ))}
        </FilterChipBar>

        {filteredMembers.length > 0 ? (
          <div aria-label={t("listLabel")} className={styles.groupCard}>
            {filteredMembers.map((member, index) => {
              const isCheckedIn = checkedInIds.has(member.id);
              const fillPercent = Math.min(
                Math.round((member.sessionsUsed / member.sessionsTotal) * 100),
                100,
              );

              return (
                <div key={member.id}>
                  <div className={styles.row}>
                    <Image
                      alt={member.name}
                      className={styles.avatar}
                      height={44}
                      src={member.avatar}
                      width={44}
                    />
                    <div className={styles.rowBody}>
                      <div className={styles.rowTop}>
                        <Typography
                          className={styles.rowName}
                          type="body"
                          weight="semibold"
                        >
                          {member.name}
                        </Typography>
                        <Chip
                          color={STATE_CHIP_COLOR[member.membershipState]}
                          size="sm"
                          variant="soft"
                        >
                          <Chip.Label>
                            {t(STATE_LABEL_KEY[member.membershipState])}
                          </Chip.Label>
                        </Chip>
                        {isCheckedIn ? (
                          <Chip color="success" size="sm" variant="soft">
                            <Chip.Label>{t("checkedInChip")}</Chip.Label>
                          </Chip>
                        ) : null}
                      </div>
                      <Typography className={styles.rowPlan} type="body-sm">
                        {member.planName}
                      </Typography>
                      <Typography className={styles.rowMeta} type="body-sm">
                        {member.lastCheckInLabel}
                      </Typography>
                      <div className={styles.progress}>
                        <div className={styles.progressRow}>
                          <Typography
                            className={styles.progressLabel}
                            type="body-sm"
                          >
                            {t("sessionsLabel")}
                          </Typography>
                          <span className={styles.progressValue}>
                            {member.sessionsUsed}/{member.sessionsTotal}
                          </span>
                        </div>
                        <span aria-hidden className={styles.progressTrack}>
                          <span
                            className={styles.progressFill}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </span>
                      </div>
                    </div>
                    <div className={styles.rowEnd}>
                      <Button
                        aria-label={t("checkInAction", { name: member.name })}
                        isIconOnly
                        onPress={() => toggleCheckIn(member.id)}
                        size="lg"
                        variant="ghost"
                      >
                        <CheckCircle
                          className={
                            isCheckedIn ? "text-success" : "text-muted"
                          }
                          size={22}
                        />
                      </Button>
                    </div>
                  </div>
                  {index < filteredMembers.length - 1 ? (
                    <div aria-hidden className={styles.divider} />
                  ) : null}
                </div>
              );
            })}
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
