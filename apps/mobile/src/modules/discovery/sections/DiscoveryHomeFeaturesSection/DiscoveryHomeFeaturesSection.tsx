"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { AchievementTag } from "@repo/ui/cards/AchievementTag";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { discoveryFeatureIcon } from "../../lib/discovery-home-icons";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeFeaturesSectionVariants } from "./DiscoveryHomeFeaturesSection.styles";
import type { DiscoveryHomeFeaturesSectionProps } from "./DiscoveryHomeFeaturesSection.types";

export function DiscoveryHomeFeaturesSection({
  features,
}: DiscoveryHomeFeaturesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeFeaturesSectionVariants();

  if (features.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={t("featuresTitle")}
      title={t("featuresTitle")}
    >
      {features.map((feature) => (
        <Button size="lg"
          aria-label={feature.title}
          className={slots.slide()}
          key={feature.id}
          variant="ghost"
          onPress={() => router.push(feature.href)}
        >
          <AchievementTag
            color={feature.color}
            icon={discoveryFeatureIcon(feature.iconKey)}
          />
          <Typography className={slots.label()} type="body-xs">
            {feature.title}
          </Typography>
        </Button>
      ))}
    </DiscoverySectionRail>
  );
}
