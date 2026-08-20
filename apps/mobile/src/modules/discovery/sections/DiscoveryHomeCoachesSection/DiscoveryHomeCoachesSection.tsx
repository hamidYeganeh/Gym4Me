"use client";

import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeCoachesSectionVariants } from "./DiscoveryHomeCoachesSection.styles";
import type { DiscoveryHomeCoachesSectionProps } from "./DiscoveryHomeCoachesSection.types";

export function DiscoveryHomeCoachesSection({
  coaches,
  coachCityName,
}: DiscoveryHomeCoachesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeCoachesSectionVariants();

  if (coaches.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={t("coachesTitle", { city: coachCityName })}
      hint={t("coachesHint", { city: coachCityName })}
      seeAllLabel={t("seeAll")}
      title={t("coachesTitle", { city: coachCityName })}
      onSeeAll={() => router.push("/discovery/coaches")}
    >
      {coaches.map((coach) => (
        <CoachFeatureCard
          certifiedLabel={
            coach.isCertified ? t("certifiedLabel") : undefined
          }
          className={slots.card()}
          experienceLabel={t("yoe", { years: coach.yearsExperience })}
          image={coach.image || PLACEHOLDER_IMAGE}
          imageAlt={coach.name}
          isNew={coach.isNew}
          key={coach.id}
          newLabel={t("newLabel")}
          rating={coach.rating}
          ratingCount={coach.ratingCount}
          specialty={coach.specialty}
          title={coach.name}
          onPress={() => router.push(`/discovery/coaches/${coach.id}`)}
        />
      ))}
    </DiscoverySectionRail>
  );
}
