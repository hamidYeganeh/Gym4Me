"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Plus } from "@repo/icons/Plus";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { profileLocationsListSectionVariants } from "./ProfileLocationsListSection.styles";
import type { ProfileLocationsListSectionProps } from "./ProfileLocationsListSection.types";

export function ProfileLocationsListSection({
  items,
  loading,
  error,
  emptyLabel,
  emptyHint,
  addLabel,
  retryLabel,
  onRetry,
  onAdd,
  onSelect,
  className,
}: ProfileLocationsListSectionProps) {
  const styles = profileLocationsListSectionVariants();

  if (error) {
    return (
      <div className={styles.status({ className })}>
        <Typography className={styles.emptyText()} type="body">
          {error}
        </Typography>
        <Button className={styles.retry()} onPress={onRetry} variant="outline" size="lg">
          {retryLabel}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.status({ className })}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        className={className}
        description={emptyHint}
        illustration={EMPTY_STATE_ILLUSTRATIONS.locations}
        illustrationAlt=""
        layout="media"
        primaryAction={
          onAdd
            ? {
                label: addLabel,
                onPress: onAdd,
                endContent: <Plus size={18} />,
              }
            : undefined
        }
        title={emptyLabel}
      />
    );
  }

  return (
    <section className={styles.root({ className })}>
      <div className={styles.list()}>
        {items.map(({ item, title, line, icon }) => (
          <Button size="lg"
            className={styles.item()}
            key={item.id}
            onPress={() => onSelect(item)}
            variant="ghost"
          >
            <span aria-hidden className={styles.icon()}>
              {icon}
            </span>
            <span className={styles.copy()}>
              <Typography className={styles.label()} type="body" weight="semibold">
                {title}
              </Typography>
              <Typography className={styles.line()} type="body-sm">
                {line || "—"}
              </Typography>
            </span>
            <ChevronLeft aria-hidden className="shrink-0 text-muted" size={18} />
          </Button>
        ))}
      </div>
    </section>
  );
}
