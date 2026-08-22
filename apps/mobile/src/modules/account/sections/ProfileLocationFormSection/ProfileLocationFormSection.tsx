"use client";

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { AlertDialog } from "@heroui/react/alert-dialog";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Building1 } from "@repo/icons/Building1";
import { Check } from "@repo/icons/Check";
import { MapPin1 } from "@repo/icons/MapPin1";
import { Trash1 } from "@repo/icons/Trash1";
import type { LocationPickerLatLng } from "@repo/ui/kit/LocationPickerMap";
import { useTranslations } from "next-intl";
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

export function ProfileLocationFormSection({
  values,
  kinds,
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <>
      <form className={styles.root({ className })} onSubmit={handleSubmit}>
        <div className={styles.field()}>
          <Typography className={styles.label()}>{t("kindLabel")}</Typography>
          <div className={styles.kinds()}>
            {kinds.map((kind) => (
              <Button
                className={styles.kindButton()}
                data-selected={values.kind === kind.id || undefined}
                key={kind.id}
                onPress={() => onChange({ kind: kind.id })}
                type="button"
                variant="ghost"
              >
                {kind.icon}
                <Typography type="body-xs" weight="semibold">
                  {kind.label}
                </Typography>
              </Button>
            ))}
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
          <Input className={styles.input()} placeholder={t("labelPlaceholder")} />
        </TextField>

        <TextField
          className={styles.field()}
          fullWidth
          name="street"
          onChange={(street) =>
            onChange({ address: { ...values.address, street } })
          }
          value={values.address.street}
        >
          <Label className={styles.label()}>{t("street")}</Label>
          <InputGroup className={styles.inputGroup()} variant="secondary">
            <InputGroup.Prefix>
              <MapPin1 className={styles.icon()} size={FIELD_ICON} />
            </InputGroup.Prefix>
            <InputGroup.Input className={styles.input()} />
          </InputGroup>
        </TextField>

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
              zoomLabel={t("zoom")}
              zoomOutLabel={t("zoomOut")}
            />
          </div>
          <Typography className={styles.mapStatus()} role="status" type="body-sm">
            {values.address.mapPoint
              ? `${t("coordinatesReady")} (${values.address.mapPoint.lat.toFixed(5)}, ${values.address.mapPoint.lng.toFixed(5)})`
              : t("coordinatesMissing")}
          </Typography>
        </div>

        <TextField
          className={styles.field()}
          fullWidth
          name="city"
          onChange={(city) =>
            onChange({ address: { ...values.address, city } })
          }
          value={values.address.city}
        >
          <Label className={styles.label()}>{t("city")}</Label>
          <Input className={styles.input()} />
        </TextField>

        <div className={styles.row()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="apartment"
            onChange={(apartment) =>
              onChange({ address: { ...values.address, apartment } })
            }
            value={values.address.apartment}
          >
            <Label className={styles.label()}>{t("apartment")}</Label>
            <InputGroup className={styles.inputGroup()} variant="secondary">
              <InputGroup.Prefix>
                <Building1 className={styles.icon()} size={FIELD_ICON} />
              </InputGroup.Prefix>
              <InputGroup.Input className={styles.input()} />
            </InputGroup>
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="postalCode"
            onChange={(postalCode) =>
              onChange({ address: { ...values.address, postalCode } })
            }
            value={values.address.postalCode}
          >
            <Label className={styles.label()}>{t("postalCode")}</Label>
            <Input
              className={styles.input()}
              inputMode="numeric"
              maxLength={10}
            />
          </TextField>
        </div>
        <Typography className={styles.hint()} type="body-sm">
          {t("postalCodeHint")}
        </Typography>

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
