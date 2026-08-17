"use client";

import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeClassesSectionVariants } from "./DiscoveryHomeClassesSection.styles";
import type { DiscoveryHomeClassesSectionProps } from "./DiscoveryHomeClassesSection.types";

export function DiscoveryHomeClassesSection({
  classes,
}: DiscoveryHomeClassesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeClassesSectionVariants();

  if (classes.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={t("classesTitle")}
      hint={t("classesHint")}
      seeAllLabel={t("seeAll")}
      title={t("classesTitle")}
      onSeeAll={() => router.push("/discovery/classes")}
    >
      {classes.map((item) => {
        const href = `/discovery/classes/${item.id}?clubId=${encodeURIComponent(item.clubId)}`;
        return (
          <ClubClassCard
            actionLabel={t("viewClass")}
            author={item.author}
            backgroundImage={item.backgroundImage}
            backgroundImageAlt={item.title}
            category={item.category}
            className={slots.card()}
            date={item.date}
            duration={item.duration}
            key={`${item.clubId}-${item.id}`}
            size="md"
            title={item.title}
            onAction={() => router.push(href)}
          />
        );
      })}
    </DiscoverySectionRail>
  );
}
