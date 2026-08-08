"use client";

import { Button, Typography } from "@heroui/react";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Megaphone } from "@repo/icons/Megaphone";
import { Ticket } from "@repo/icons/Ticket";
import { Wallet } from "@repo/icons/Wallet";
import {
  NotificationCard,
  NotificationCardSkeleton,
} from "@repo/ui/cards/NotificationCard";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { accountNotifications } from "@/shared/lib/api";
import {
  groupNotifications,
  type InboxGroup,
  type NotificationKind,
} from "../../lib/notifications-adapter";
import { notificationsScreenStyles as styles } from "./NotificationsScreen.styles";
import type {
  NotificationsFilterId,
  NotificationsScreenProps,
} from "./NotificationsScreen.types";

const CARD_ICON_SIZE = 20;

const FILTER_IDS: NotificationsFilterId[] = ["all", "bookings", "finance"];

const FILTER_KINDS: Record<NotificationsFilterId, NotificationKind[]> = {
  all: ["booking", "payment", "membership", "promo"],
  bookings: ["booking"],
  finance: ["payment", "membership"],
};

const KIND_ICONS: Record<NotificationKind, ReactNode> = {
  booking: <Calendar1 size={CARD_ICON_SIZE} />,
  payment: <Wallet size={CARD_ICON_SIZE} />,
  membership: <Ticket size={CARD_ICON_SIZE} />,
  promo: <Megaphone size={CARD_ICON_SIZE} />,
};

/** Kind → in-app destination per role; null = no matching page for that role. */
function actionTarget(
  kind: NotificationKind,
  roleSegment: "athlete" | "coach" | "owner",
): string | null {
  switch (kind) {
    case "booking":
      return roleSegment === "owner" ? null : `/${roleSegment}/bookings`;
    case "membership":
      return roleSegment === "athlete" ? "/athlete/memberships" : null;
    case "payment":
      if (roleSegment === "athlete") return "/athlete/wallet";
      if (roleSegment === "coach") return "/coach/earnings";
      return "/owner/finance";
    default:
      return null;
  }
}

export function NotificationsScreen({
  roleSegment = "athlete",
}: NotificationsScreenProps) {
  const t = useTranslations("Notifications");
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<NotificationsFilterId>("all");
  const [groups, setGroups] = useState<InboxGroup[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setHasError(false);
      setGroups(null);
      try {
        const inbox = await accountNotifications.list({ limit: 50 });
        if (cancelled) return;
        setGroups(groupNotifications(inbox.items));
        if (inbox.meta.unreadCount > 0) {
          void accountNotifications.markAllRead().catch(() => undefined);
        }
      } catch {
        if (!cancelled) setHasError(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  const visibleGroups = (groups ?? [])
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        FILTER_KINDS[activeFilter].includes(item.kind),
      ),
    }))
    .filter((group) => group.items.length > 0);

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
            {t("subtitle")}
          </Typography>
        </section>

        <FilterChipBar aria-label={t("filtersLabel")}>
          {FILTER_IDS.map((filterId) => (
            <FilterChip
              key={filterId}
              onPress={() => setActiveFilter(filterId)}
              selected={activeFilter === filterId}
            >
              {t(`filters.${filterId}`)}
            </FilterChip>
          ))}
        </FilterChipBar>

        {groups === null && !hasError ? (
          <div className={styles.groups} aria-busy="true" aria-live="polite">
            <NotificationCardSkeleton />
            <NotificationCardSkeleton />
            <NotificationCardSkeleton showProgress />
          </div>
        ) : hasError ? (
          <EmptyState
            description={t("loadError")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.warning}
            illustrationAlt=""
            layout="media"
            primaryAction={{
              label: t("retry"),
              onPress: retry,
            }}
            status="danger"
            title={t("loadErrorTitle")}
          />
        ) : visibleGroups.length > 0 ? (
          <div className={styles.groups}>
            {visibleGroups.map((group) => (
              <section className={styles.group} key={group.id}>
                <Typography className={styles.groupTitle} type="body-sm">
                  {t(`groups.${group.id}`)}
                </Typography>
                <div className={styles.groupList}>
                  {group.items.map((notification) => {
                    const target = actionTarget(notification.kind, roleSegment);
                    return (
                      <NotificationCard
                        badge={notification.unread ? t("badgeNew") : undefined}
                        description={notification.description}
                        icon={KIND_ICONS[notification.kind]}
                        key={notification.id}
                        primaryAction={
                          target
                            ? {
                                label: t("viewAction"),
                                onPress: () => router.push(target),
                              }
                            : undefined
                        }
                        timestamp={notification.timestamp}
                        title={notification.title}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            description={t("emptyBody")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.calendar}
            illustrationAlt=""
            layout="media"
            title={t("emptyTitle")}
          />
        )}
      </div>
    </AppLayout>
  );
}
