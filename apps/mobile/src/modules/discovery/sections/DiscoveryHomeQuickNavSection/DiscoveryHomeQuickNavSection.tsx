"use client";

import { Building2 } from "@repo/icons/Building2";
import { MapTrifold } from "@repo/icons/MapTrifold";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { discoveryHomeQuickNavSectionVariants } from "./DiscoveryHomeQuickNavSection.styles";

const ICON_SIZE = 22;

export function DiscoveryHomeQuickNavSection() {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeQuickNavSectionVariants();

  return (
    <nav aria-label={t("quickNavLabel")} className={slots.root()}>
      <QuickActionCard
        className={slots.map()}
        icon={<MapTrifold size={ICON_SIZE} />}
        label={t("quickMap")}
        labelClassName={slots.mapLabel()}
        layout="row"
        tileClassName={slots.mapTile()}
        onPress={() => router.push("/discovery/map")}
      />
      <QuickActionCard
        icon={<Building2 size={ICON_SIZE} />}
        label={t("quickClubs")}
        layout="row"
        onPress={() => router.push("/discovery/clubs")}
      />
      <QuickActionCard
        className={slots.wide()}
        icon={<UsersTwo size={ICON_SIZE} />}
        label={t("quickCoaches")}
        layout="row"
        onPress={() => router.push("/discovery/coaches")}
      />
    </nav>
  );
}
