"use client";

import {
  ClubCategoryTile,
  ClubCategoryTileSkeleton,
} from "@repo/ui/cards/ClubCategoryTile";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import {
  CLUB_CATEGORY_GRID_ROWS,
  chunkCarouselColumns,
} from "../../lib/discovery-home-carousel";
import { discoveryClubCategoryIcon } from "../../lib/discovery-home-icons";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeClubCategoriesSectionVariants } from "./DiscoveryHomeClubCategoriesSection.styles";
import type { DiscoveryHomeClubCategoriesSectionProps } from "./DiscoveryHomeClubCategoriesSection.types";

const CATEGORY_SKELETON_COLUMNS = 3;

export function DiscoveryHomeClubCategoriesSection({
  categories,
  isLoading = false,
  title,
  hint,
  tone = "warning",
  pattern = true,
}: DiscoveryHomeClubCategoriesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeClubCategoriesSectionVariants();

  if (!isLoading && categories.length === 0) return null;

  const columns = isLoading
    ? Array.from({ length: CATEGORY_SKELETON_COLUMNS }, (_, column) => ({
        key: `category-column-skeleton-${column}`,
        tiles: Array.from({ length: CLUB_CATEGORY_GRID_ROWS }, (__, row) => (
          <ClubCategoryTileSkeleton
            className={slots.card()}
            key={`category-skeleton-${column}-${row}`}
          />
        )),
      }))
    : chunkCarouselColumns(categories, CLUB_CATEGORY_GRID_ROWS).map(
        (column) => ({
          key: column.map((item) => item.id).join("-"),
          tiles: column.map((item) => (
            <ClubCategoryTile
              className={slots.card()}
              icon={discoveryClubCategoryIcon(item.iconKey)}
              key={item.id}
              subtitle={
                item.count != null
                  ? t("clubCount", {
                      count: new Intl.NumberFormat("fa-IR").format(item.count),
                    })
                  : undefined
              }
              title={item.name}
              onPress={() => router.push(item.href)}
            />
          )),
        }),
      );

  return (
    <DiscoverySectionRail
      ariaLabel={title ?? t("categoriesTitle")}
      hint={hint ?? t("categoriesHint")}
      pattern={pattern}
      sheet
      slideClassName={slots.slide()}
      title={title ?? t("categoriesTitle")}
      tone={tone}
    >
      {columns.map((column) => (
        <div className={slots.column()} key={column.key}>
          {column.tiles}
        </div>
      ))}
    </DiscoverySectionRail>
  );
}
