"use client";

import { Typography } from "@heroui/react";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { ownerClubsCreateCatalogSectionVariants } from "./OwnerClubsCreateCatalogSection.styles";
import type { OwnerClubsCreateCatalogSectionProps } from "./OwnerClubsCreateCatalogSection.types";

export function OwnerClubsCreateCatalogSection({
  title,
  hint,
  isLoading,
  options,
  selectedIds,
  onToggle,
  className,
}: OwnerClubsCreateCatalogSectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateCatalogSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="bold">
          {title}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {hint}
        </Typography>
      </div>

      {isLoading ? (
        <Typography className={styles.hint()} type="body-sm">
          {t("catalogLoading")}
        </Typography>
      ) : options.length === 0 ? (
        <Typography color="muted" type="body-sm">
          {t("catalogEmpty")}
        </Typography>
      ) : (
        <div className={styles.chips()}>
          {options.map((option) => (
            <FilterChip
              key={option.id}
              selected={selectedIds.includes(option.id)}
              onPress={() => onToggle(option.id)}
            >
              {option.name}
            </FilterChip>
          ))}
        </div>
      )}
    </section>
  );
}
