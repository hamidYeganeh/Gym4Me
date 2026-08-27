"use client";

import {
  SportCategoryCard,
  SportCategoryCardSkeleton,
} from "@repo/ui/cards/SportCategoryCard";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { discoverySportIcon } from "../../lib/discovery-home-icons";
import { homeSportTheme } from "../../lib/sports-home";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeSportCategoriesSectionVariants } from "./DiscoveryHomeSportCategoriesSection.styles";
import type { DiscoveryHomeSportCategoriesSectionProps } from "./DiscoveryHomeSportCategoriesSection.types";

const CATEGORY_SKELETON_COUNT = 3;
const CATEGORY_ICON_SIZE = 32;

export function DiscoveryHomeSportCategoriesSection({
  categories,
  isLoading = false,
  title,
  hint,
  seeAllHref = "/discovery/sports",
  seeAllLabel,
  seeAllVariant,
}: DiscoveryHomeSportCategoriesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeSportCategoriesSectionVariants();

  if (!isLoading && categories.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={title ?? t("sportCategoriesTitle")}
      hint={hint ?? t("sportCategoriesHint")}
      seeAllLabel={seeAllLabel ?? t("seeAll")}
      seeAllVariant={seeAllVariant}
      sheet
      slideClassName={slots.slide()}
      title={title ?? t("sportCategoriesTitle")}
      tone="surface"
      onSeeAll={() => router.push(seeAllHref)}
    >
      {isLoading
        ? Array.from({ length: CATEGORY_SKELETON_COUNT }, (_, index) => (
            <SportCategoryCardSkeleton
              className={slots.card()}
              key={`sport-category-skeleton-${index}`}
              size="md"
            />
          ))
        : categories.map((category, index) => {
            const theme = homeSportTheme(index);
            return (
              <SportCategoryCard
                actionColor={theme.actionColor}
                actionForegroundColor={theme.actionForegroundColor}
                actionLabel={t("viewSportCategory")}
                category={{
                  title: category.name,
                  subtitle: category.description ?? t("sportLabel"),
                  backgroundImage: category.image,
                  icon: discoverySportIcon(
                    category.iconKey,
                    CATEGORY_ICON_SIZE,
                  ),
                }}
                className={slots.card()}
                color={theme.color}
                foregroundColor={theme.foregroundColor}
                key={category.id}
                size="md"
                onPress={() => router.push(category.href)}
              />
            );
          })}
    </DiscoverySectionRail>
  );
}
