"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Controller } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { MapPin1 } from "@repo/icons/MapPin1";
import type { LocationPickerLatLng } from "@repo/ui/kit/LocationPickerMap";
import { useTranslations } from "next-intl";
import { useClubCreateLocation } from "@/modules/owner/lib/use-club-create-location";
import { OwnerClubsCreateLocationChoiceSheet } from "@/modules/owner/sections/OwnerClubsCreateLocationChoiceSheet";
import { ownerClubsCreateLocationSectionVariants } from "./OwnerClubsCreateLocationSection.styles";
import type { OwnerClubsCreateLocationSectionProps } from "./OwnerClubsCreateLocationSection.types";

const FIELD_ICON = 18;

const LocationPickerMap = dynamic(
  () =>
    import("@repo/ui/kit/LocationPickerMap").then(
      (mod) => mod.LocationPickerMap,
    ),
  { ssr: false },
);

type LocationSheetKind = "country" | "province" | "city" | "district" | null;

export function OwnerClubsCreateLocationSection({
  control,
  setValue,
  getValues,
  className,
}: OwnerClubsCreateLocationSectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateLocationSectionVariants();
  const [sheet, setSheet] = useState<LocationSheetKind>(null);

  const {
    location,
    countries,
    provinces,
    cities,
    districts,
    patchLocation,
    selectCountry,
    selectProvince,
    selectCity,
    selectDistrict,
  } = useClubCreateLocation(control, setValue, getValues);

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="bold">
          {t("stepLocation")}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {t("stepLocationHint")}
        </Typography>
      </div>

      <div className={styles.form()}>
        <div className={styles.field()}>
          <Typography className={styles.fieldLabel()}>{t("country")}</Typography>
          <Button size="lg"
            className={styles.trigger()}
            onPress={() => setSheet("country")}
            type="button"
            variant="ghost"
          >
            <span aria-hidden className={styles.triggerIcon()}>
              <MapPin1 size={FIELD_ICON} />
            </span>
            <span
              className={
                location.country ? styles.triggerValue() : styles.triggerPlaceholder()
              }
            >
              {location.country || t("countryPlaceholder")}
            </span>
            <ChevronDown aria-hidden className={styles.triggerTrailing()} size={FIELD_ICON} />
          </Button>
        </div>

        <div className={styles.field()}>
          <Typography className={styles.fieldLabel()}>{t("province")}</Typography>
          <Button size="lg"
            className={styles.trigger()}
            onPress={() => setSheet("province")}
            type="button"
            variant="ghost"
          >
            <span aria-hidden className={styles.triggerIcon()}>
              <MapPin1 size={FIELD_ICON} />
            </span>
            <span
              className={
                location.province
                  ? styles.triggerValue()
                  : styles.triggerPlaceholder()
              }
            >
              {location.province || t("provincePlaceholder")}
            </span>
            <ChevronDown aria-hidden className={styles.triggerTrailing()} size={FIELD_ICON} />
          </Button>
        </div>

        <div className={styles.field()}>
          <Typography className={styles.fieldLabel()}>{t("city")}</Typography>
          <Button size="lg"
            className={styles.trigger()}
            onPress={() => setSheet("city")}
            type="button"
            variant="ghost"
          >
            <span aria-hidden className={styles.triggerIcon()}>
              <MapPin1 size={FIELD_ICON} />
            </span>
            <span
              className={
                location.city ? styles.triggerValue() : styles.triggerPlaceholder()
              }
            >
              {location.city || t("cityPlaceholder")}
            </span>
            <ChevronDown aria-hidden className={styles.triggerTrailing()} size={FIELD_ICON} />
          </Button>
        </div>

        <div className={styles.field()}>
          <Typography className={styles.fieldLabel()}>{t("district")}</Typography>
          <Button size="lg"
            className={styles.trigger()}
            onPress={() => setSheet("district")}
            type="button"
            variant="ghost"
          >
            <span aria-hidden className={styles.triggerIcon()}>
              <MapPin1 size={FIELD_ICON} />
            </span>
            <span
              className={
                location.district
                  ? styles.triggerValue()
                  : styles.triggerPlaceholder()
              }
            >
              {location.district || t("districtPlaceholder")}
            </span>
            <ChevronDown aria-hidden className={styles.triggerTrailing()} size={FIELD_ICON} />
          </Button>
        </div>

        <Controller
          control={control}
          name="location.address"
          render={({ field }) => (
            <TextField
              className={styles.field()}
              fullWidth
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("address")}</Label>
              <Input placeholder={t("addressPlaceholder")} ref={field.ref} />
            </TextField>
          )}
        />

        <div className={styles.field()}>
          <Typography className={styles.hint()} type="body-sm">
            {t("mapHint")}
          </Typography>
          <div className={styles.mapWrap()}>
            <LocationPickerMap
              value={location.point}
              zoomInLabel={t("mapZoomIn")}
              zoomOutLabel={t("mapZoomOut")}
              onChange={(point: LocationPickerLatLng) =>
                patchLocation({ point })
              }
            />
          </div>
          <Typography className={styles.mapStatus()} role="status" type="body-sm">
            {location.point
              ? `${t("coordinatesReady")} (${location.point.lat.toFixed(5)}, ${location.point.lng.toFixed(5)})`
              : t("coordinatesMissing")}
          </Typography>
        </div>
      </div>

      <OwnerClubsCreateLocationChoiceSheet
        emptyLabel={t("countryEmpty")}
        isOpen={sheet === "country"}
        onClose={() => setSheet(null)}
        onSelect={(option) => {
          selectCountry(option);
          setSheet(null);
        }}
        options={countries}
        title={t("country")}
        value={location.countryId}
      />

      <OwnerClubsCreateLocationChoiceSheet
        emptyLabel={
          location.countryId ? t("provinceEmpty") : t("provinceNeedsCountry")
        }
        isOpen={sheet === "province"}
        onClose={() => setSheet(null)}
        onSelect={(option) => {
          selectProvince(option);
          setSheet(null);
        }}
        options={provinces}
        title={t("province")}
        value={location.provinceId}
      />

      <OwnerClubsCreateLocationChoiceSheet
        emptyLabel={
          location.provinceId ? t("cityEmpty") : t("cityNeedsProvince")
        }
        isOpen={sheet === "city"}
        onClose={() => setSheet(null)}
        onSelect={(option) => {
          selectCity(option);
          setSheet(null);
        }}
        options={cities}
        title={t("city")}
        value={location.cityId}
      />

      <OwnerClubsCreateLocationChoiceSheet
        emptyLabel={
          location.cityId ? t("districtEmpty") : t("districtNeedsCity")
        }
        isOpen={sheet === "district"}
        onClose={() => setSheet(null)}
        onSelect={(option) => {
          selectDistrict(option);
          setSheet(null);
        }}
        options={districts}
        title={t("district")}
        value={location.districtId}
      />
    </section>
  );
}
