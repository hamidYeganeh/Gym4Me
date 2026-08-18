"use client";

import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { EquipmentBrowseCard } from "@repo/ui/cards/EquipmentBrowseCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { discoveryHomeEquipmentSectionVariants } from "./DiscoveryHomeEquipmentSection.styles";
import type { DiscoveryHomeEquipmentSectionProps } from "./DiscoveryHomeEquipmentSection.types";

export function DiscoveryHomeEquipmentSection({
  equipment,
}: DiscoveryHomeEquipmentSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeEquipmentSectionVariants();

  if (equipment.length === 0) return null;

  return (
    <section aria-label={t("equipmentTitle")} className={slots.root()}>
      <div className={slots.header()}>
        <div className={slots.titleRow()}>
          <span aria-hidden className={slots.accent()} />
          <Typography className={slots.title()} type="h3" weight="bold">
            {t("equipmentTitle")}
          </Typography>
        </div>
        <Link
          className={slots.seeAll()}
          onPress={() => router.push("/discovery/clubs")}
        >
          {t("seeAll")}
        </Link>
      </div>
      <div className={slots.grid()}>
        {equipment.map((item) => (
          <EquipmentBrowseCard
            image={item.image || PLACEHOLDER_IMAGE}
            imageAlt={item.name}
            key={item.id}
            size={item.size ?? "md"}
            title={item.name}
            onPress={() => router.push(item.href)}
          />
        ))}
      </div>
    </section>
  );
}
