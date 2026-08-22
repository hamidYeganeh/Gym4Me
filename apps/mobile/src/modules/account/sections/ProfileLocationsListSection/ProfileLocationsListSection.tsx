"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { profileLocationsListSectionVariants } from "./ProfileLocationsListSection.styles";
import type { ProfileLocationsListSectionProps } from "./ProfileLocationsListSection.types";

export function ProfileLocationsListSection({
  items,
  loading,
  error,
  emptyLabel,
  emptyHint,
  retryLabel,
  onRetry,
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
        <Button className={styles.retry()} onPress={onRetry} variant="outline">
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
      <div className={styles.empty({ className })}>
        <Typography className={styles.emptyText()} type="body">
          {emptyLabel}
        </Typography>
        <Typography className={styles.emptyText()} type="body-sm">
          {emptyHint}
        </Typography>
      </div>
    );
  }

  return (
    <section className={styles.root({ className })}>
      <div className={styles.list()}>
        {items.map(({ item, title, line, icon }) => (
          <Button
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
