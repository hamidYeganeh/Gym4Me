"use client";

import { ClubGalleryCard } from "@repo/ui/cards/ClubGalleryCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeGalleryRailSectionVariants } from "./DiscoveryHomeGalleryRailSection.styles";
import type { DiscoveryHomeGalleryRailSectionProps } from "./DiscoveryHomeGalleryRailSection.types";

export function DiscoveryHomeGalleryRailSection({
  galleryItems,
}: DiscoveryHomeGalleryRailSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeGalleryRailSectionVariants();

  if (galleryItems.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={t("galleryTitle")}
      hint={t("galleryHint")}
      seeAllLabel={t("seeAll")}
      title={t("galleryTitle")}
      onSeeAll={() => router.push("/discovery/clubs")}
    >
      {galleryItems.map((item) => (
        <ClubGalleryCard
          actionLabel={t("viewGallery")}
          author={item.author}
          className={slots.card()}
          image={item.image || PLACEHOLDER_IMAGE}
          imageAlt={item.title}
          key={item.id}
          mediaKind="image"
          title={item.title}
          viewsLabel={item.viewsLabel}
          onPress={() => router.push(`/discovery/clubs/${item.clubId}`)}
        />
      ))}
    </DiscoverySectionRail>
  );
}
