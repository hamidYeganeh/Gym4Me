"use client";

import { useCallback, useState } from "react";
import { ProfileLocationChoiceSheet } from "@/modules/account/sections/ProfileLocationChoiceSheet";
import { useRouter } from "@/shared/lib/app-router";
import { useDiscoveryLocationCascade } from "../../lib/use-discovery-location-cascade";
import { DiscoveryLocationMapCtaSection } from "../DiscoveryLocationMapCtaSection";
import { discoveryLocationSectionVariants } from "./DiscoveryLocationSection.styles";
import type { DiscoveryLocationSectionProps } from "./DiscoveryLocationSection.types";

type LocationSheetKind = "province" | "city" | "district" | null;

export function DiscoveryLocationSection({
  target,
  title,
  subtitle,
  ctaLabel,
  provinceLabel,
  cityLabel,
  districtLabel,
  provinceEmptyLabel,
  cityEmptyLabel,
  districtEmptyLabel,
  cityNeedsProvinceLabel,
  districtNeedsCityLabel,
}: DiscoveryLocationSectionProps) {
  const router = useRouter();
  const slots = discoveryLocationSectionVariants();
  const [sheet, setSheet] = useState<LocationSheetKind>(null);
  const {
    provinces,
    cities,
    districts,
    selection,
    resolvedLocationId,
    selectProvince,
    selectCity,
    selectDistrict,
    resetSelection,
  } = useDiscoveryLocationCascade();

  const navigateWithSelection = useCallback(() => {
    if (target === "map") {
      router.push("/discovery/map");
      return;
    }

    if (!resolvedLocationId) return;

    if (target === "clubs") {
      router.push(
        `/discovery/clubs?locationId=${encodeURIComponent(resolvedLocationId)}`,
      );
      return;
    }

    router.push(
      `/discovery/coaches?cityId=${encodeURIComponent(resolvedLocationId)}`,
    );
  }, [resolvedLocationId, router, target]);

  const openPicker = () => {
    if (target === "map") {
      router.push("/discovery/map");
      return;
    }
    resetSelection();
    setSheet("province");
  };

  const closeSheets = () => {
    setSheet(null);
    resetSelection();
  };

  return (
    <section className={slots.root()}>
      <DiscoveryLocationMapCtaSection
        ctaLabel={ctaLabel}
        subtitle={subtitle}
        title={title}
        onPress={openPicker}
      />

      <ProfileLocationChoiceSheet
        emptyLabel={provinceEmptyLabel}
        isOpen={sheet === "province"}
        onClose={closeSheets}
        onSelect={(option) => {
          selectProvince(option);
          setSheet("city");
        }}
        options={provinces}
        title={provinceLabel}
        value={selection.provinceId}
      />

      <ProfileLocationChoiceSheet
        emptyLabel={
          selection.provinceId ? cityEmptyLabel : cityNeedsProvinceLabel
        }
        isOpen={sheet === "city"}
        onClose={closeSheets}
        onSelect={(option) => {
          selectCity(option);
          setSheet("district");
        }}
        options={cities}
        title={cityLabel}
        value={selection.cityId}
      />

      <ProfileLocationChoiceSheet
        emptyLabel={
          selection.cityId ? districtEmptyLabel : districtNeedsCityLabel
        }
        isOpen={sheet === "district"}
        onClose={() => {
          navigateWithSelection();
          closeSheets();
        }}
        onSelect={(option) => {
          selectDistrict(option);
          navigateWithSelection();
          closeSheets();
        }}
        options={districts}
        title={districtLabel}
        value={selection.districtId}
      />
    </section>
  );
}
