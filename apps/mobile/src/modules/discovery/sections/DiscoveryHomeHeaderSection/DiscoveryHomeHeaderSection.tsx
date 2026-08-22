"use client";

import { Button } from "@heroui/react/button";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { Funnel1 } from "@repo/icons/Funnel1";
import { MapPin1 } from "@repo/icons/MapPin1";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/shared/lib/app-router";
import { useAuth } from "@/shared/providers/AuthProvider";
import { roleAppPath } from "@/shared/lib/role-routes";

import {
  buildDiscoveryAddresses,
} from "../../lib/discovery-home-addresses";
import { DiscoveryLocationSheet } from "../DiscoveryLocationSheet";
import { discoveryHomeHeaderSectionVariants } from "./DiscoveryHomeHeaderSection.styles";
import type { DiscoveryHomeHeaderSectionProps } from "./DiscoveryHomeHeaderSection.types";

export function DiscoveryHomeHeaderSection({
  locationLabel: locationFallback,
  coachCityName,
  citiesFallbackName,
}: DiscoveryHomeHeaderSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const { user, isAuthenticated, activeRole } = useAuth();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const slots = discoveryHomeHeaderSectionVariants();

  const addresses = buildDiscoveryAddresses(user, {
    profile: t("locationProfileLabel"),
    home: t("locationKindHome"),
    work: t("locationKindWork"),
    gym: t("locationKindGym"),
    other: t("locationKindOther"),
  });
  const selectedAddress =
    addresses.find((item) => item.id === selectedAddressId) ??
    addresses[0] ??
    null;

  const locationLabel =
    selectedAddress?.city ||
    selectedAddress?.label ||
    coachCityName ||
    citiesFallbackName ||
    locationFallback ||
    t("locationFallback");

  return (
    <>
      <div aria-hidden className={slots.spacer()} />
      <header className={slots.header()}>
        <div className={slots.bar()}>
          <Button
            aria-label={t("filterAria")}
            className={slots.filterButton()}
            isIconOnly
            onPress={() => router.push("/discovery/clubs")}
            size="lg"
            variant="ghost"
          >
            <Funnel1 size={22} />
          </Button>
          <Button
            aria-expanded={isLocationOpen}
            aria-haspopup="dialog"
            aria-label={t("locationChipAria", { location: locationLabel })}
            className={slots.locationChip()}
            onPress={() => setIsLocationOpen(true)}
            size="sm"
            variant="secondary"
          >
            <MapPin1 size={16} />
            <span className={slots.locationLabel()}>{locationLabel}</span>
            <ChevronDown size={16} />
          </Button>
        </div>
      </header>
      <DiscoveryLocationSheet
        addLabel={t("locationSheetAdd")}
        addresses={addresses}
        closeLabel={t("locationSheetClose")}
        description={t("locationSheetDescription")}
        emptyLabel={t("locationSheetEmpty")}
        isOpen={isLocationOpen}
        onAddNew={() =>
          router.push(
            isAuthenticated
              ? `${roleAppPath(activeRole, "profile/locations")}?create=1`
              : "/auth/login",
          )
        }
        onOpenChange={setIsLocationOpen}
        onSelect={setSelectedAddressId}
        selectedId={selectedAddress?.id ?? ""}
        title={t("locationSheetTitle")}
        updateLabel={t("locationSheetUpdate")}
      />
    </>
  );
}
