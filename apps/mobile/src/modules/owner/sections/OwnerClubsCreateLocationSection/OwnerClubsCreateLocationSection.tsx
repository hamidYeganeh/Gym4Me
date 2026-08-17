"use client";

import { Controller } from "react-hook-form";
import { Input, Label, TextField, Typography } from "@heroui/react";
import { LocationPickerMap } from "@repo/ui/kit/LocationPickerMap";
import { useTranslations } from "next-intl";
import { ownerClubsCreateLocationSectionVariants } from "./OwnerClubsCreateLocationSection.styles";
import type { OwnerClubsCreateLocationSectionProps } from "./OwnerClubsCreateLocationSection.types";

export function OwnerClubsCreateLocationSection({
  control,
  className,
}: OwnerClubsCreateLocationSectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateLocationSectionVariants();

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
        <Controller
          control={control}
          name="address"
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
          <Controller
            control={control}
            name="point"
            render={({ field }) => (
              <>
                <div className={styles.mapWrap()}>
                  <LocationPickerMap
                    value={field.value}
                    zoomInLabel={t("mapZoomIn")}
                    zoomLabel={t("mapZoom")}
                    zoomOutLabel={t("mapZoomOut")}
                    onChange={field.onChange}
                  />
                </div>
                <Typography className={styles.mapStatus()} role="status" type="body-sm">
                  {field.value
                    ? `${t("coordinatesReady")} (${field.value.lat.toFixed(5)}, ${field.value.lng.toFixed(5)})`
                    : t("coordinatesMissing")}
                </Typography>
              </>
            )}
          />
        </div>
      </div>
    </section>
  );
}
