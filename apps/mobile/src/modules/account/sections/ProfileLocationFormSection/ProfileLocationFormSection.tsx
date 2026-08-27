"use client";

import { useMemo, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { AlertDialog } from "@heroui/react/alert-dialog";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { MapPin1 } from "@repo/icons/MapPin1";
import { Trash1 } from "@repo/icons/Trash1";
import type { LocationPickerLatLng } from "@repo/ui/kit/LocationPickerMap";
import { useTranslations } from "next-intl";
import { ProfileSettingsFieldRow } from "@/modules/account/components/ProfileSettingsFieldRow";
import { ProfileLocationChoiceSheet } from "../ProfileLocationChoiceSheet";
import { profileLocationFormSectionVariants } from "./ProfileLocationFormSection.styles";
import type { ProfileLocationFormSectionProps } from "./ProfileLocationFormSection.types";

const FIELD_ICON = 18;

const LocationPickerMap = dynamic(
  () =>
    import("@repo/ui/kit/LocationPickerMap").then(
      (mod) => mod.LocationPickerMap,
    ),
  { ssr: false },
);

type LocationSheetKind = "province" | "city" | "district" | null;

export function ProfileLocationFormSection({
  values,
  kinds,
  provinces,
  cities,
  districts,
  error,
  isPending,
  isDeleting,
  canDelete,
  onChange,
  onSubmit,
  onDelete,
  className,
}: ProfileLocationFormSectionProps) {
  const t = useTranslations("Mobile.ProfileLocations");
  const styles = profileLocationFormSectionVariants();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheet, setSheet] = useState<LocationSheetKind>(null);

  const kindLabels = useMemo(
    () => new Set(kinds.map((kind) => kind.label)),
    [kinds],
  );

  const provinceName =
    provinces.find((item) => item.id === values.address.provinceId)?.name ??
    "";
  const cityName =
    cities.find((item) => item.id === values.cityId)?.name ??
    values.address.city;
  const districtName =
    districts.find((item) => item.id === values.districtId)?.name ??
    values.address.district;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const selectKind = (kind: (typeof kinds)[number]) => {
    const currentLabel = values.label.trim();
    const labelMatchesKind = kindLabels.has(currentLabel);
    if (kind.id === "other") {
      onChange({
        kind: kind.id,
        label: labelMatchesKind ? "" : values.label,
      });
      return;
    }
    onChange({
      kind: kind.id,
      label: !currentLabel || labelMatchesKind ? kind.label : values.label,
    });
  };

  return (
    <>
      <form className={styles.root({ className })} onSubmit={handleSubmit}>
        <div className={styles.field()}>
          <Typography className={styles.label()}>{t("kindLabel")}</Typography>
          <div
            aria-label={t("kindLabel")}
            className={styles.kinds()}
            role="group"
          >
            {kinds.map((kind) => {
              const selected = values.kind === kind.id;
              return (
                <Button
                  aria-pressed={selected}
                  className={styles.kindChipButton()}
                  key={kind.id}
                  onPress={() => selectKind(kind)}
                  type="button"
                  variant="ghost"
                >
                  <Chip
                    className={styles.kindChip()}
                    color={selected ? "accent" : "default"}
                    size="lg"
                    variant={selected ? "primary" : "secondary"}
                  >
                    <span aria-hidden className="inline-flex shrink-0">
                      {kind.icon}
                    </span>
                    <Chip.Label>{kind.label}</Chip.Label>
                  </Chip>
                </Button>
              );
            })}
          </div>
        </div>

        <TextField
          className={styles.field()}
          fullWidth
          name="label"
          onChange={(label) => onChange({ label })}
          value={values.label}
        >
          <Label className={styles.label()}>{t("label")}</Label>
          <Input
            className={styles.input()}
            placeholder={t("labelPlaceholder")}
          />
        </TextField>

        <ProfileSettingsFieldRow
          icon={<MapPin1 size={FIELD_ICON} />}
          label={t("province")}
          onPress={() => setSheet("province")}
          placeholder={t("provincePlaceholder")}
          value={provinceName}
        />

        <ProfileSettingsFieldRow
          icon={<MapPin1 size={FIELD_ICON} />}
          label={t("city")}
          onPress={() => setSheet("city")}
          placeholder={t("cityPlaceholder")}
          value={cityName}
        />

        <ProfileSettingsFieldRow
          icon={<MapPin1 size={FIELD_ICON} />}
          label={t("district")}
          onPress={() => setSheet("district")}
          placeholder={t("districtPlaceholder")}
          value={districtName}
        />

        <div className={styles.field()}>
          <Typography className={styles.hint()} type="body-sm">
            {t("mapHint")}
          </Typography>
          <div className={styles.mapWrap()}>
            <LocationPickerMap
              onChange={(point: LocationPickerLatLng) =>
                onChange({
                  address: { ...values.address, mapPoint: point },
                })
              }
              value={values.address.mapPoint}
              zoomInLabel={t("zoomIn")}
              zoomOutLabel={t("zoomOut")}
            />
          </div>
        </div>

        {error ? (
          <Typography className={styles.error()} role="alert" type="body-sm">
            {error}
          </Typography>
        ) : null}

        <div className={styles.actions()}>
          <Button
            className={styles.submit()}
            fullWidth
            isPending={isPending}
            size="lg"
            type="submit"
            variant="primary"
          >
            {t("save")}
            <Check size={18} />
          </Button>
          {canDelete ? (
            <Button
              className={styles.delete()}
              fullWidth
              isDisabled={isPending}
              onPress={() => setConfirmOpen(true)}
              type="button"
              variant="danger"
            >
              {t("delete")}
              <Trash1 size={18} />
            </Button>
          ) : null}
        </div>
      </form>

      <ProfileLocationChoiceSheet
        emptyLabel={t("provinceEmpty")}
        isOpen={sheet === "province"}
        onClose={() => setSheet(null)}
        onSelect={(option) => {
          onChange({
            cityId: null,
            districtId: null,
            address: {
              ...values.address,
              provinceId: option.id,
              city: "",
              district: "",
            },
          });
          setSheet(null);
        }}
        options={provinces}
        title={t("province")}
        value={values.address.provinceId}
      />

      <ProfileLocationChoiceSheet
        emptyLabel={
          values.address.provinceId
            ? t("cityEmpty")
            : t("cityNeedsProvince")
        }
        isOpen={sheet === "city"}
        onClose={() => setSheet(null)}
        onSelect={(option) => {
          onChange({
            cityId: option.id,
            districtId: null,
            address: {
              ...values.address,
              city: option.name,
              district: "",
            },
          });
          setSheet(null);
        }}
        options={cities}
        title={t("city")}
        value={values.cityId}
      />

      <ProfileLocationChoiceSheet
        emptyLabel={
          values.cityId ? t("districtEmpty") : t("districtNeedsCity")
        }
        isOpen={sheet === "district"}
        onClose={() => setSheet(null)}
        onSelect={(option) => {
          onChange({
            districtId: option.id,
            address: {
              ...values.address,
              district: option.name,
            },
          });
          setSheet(null);
        }}
        options={districts}
        title={t("district")}
        value={values.districtId}
      />

      <AlertDialog>
        <AlertDialog.Backdrop isOpen={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>{t("deleteTitle")}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <Typography type="body-sm">{t("deleteBody")}</Typography>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  {t("cancel")}
                </Button>
                <Button
                  isPending={isDeleting}
                  variant="danger"
                  onPress={() => {
                    void onDelete();
                  }}
                >
                  {t("confirmDelete")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
}
