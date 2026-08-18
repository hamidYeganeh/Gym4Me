"use client";

import { useEffect, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";
import { Input } from "@heroui/react/input";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Building1 } from "@repo/icons/Building1";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Check } from "@repo/icons/Check";
import { Flag1 } from "@repo/icons/Flag1";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { GenderMale } from "@repo/icons/GenderMale";
import { GenderTransgender } from "@repo/icons/GenderTransgender";
import { InfoCircle } from "@repo/icons/InfoCircle";
import { MapPin1 } from "@repo/icons/MapPin1";
import { User } from "@repo/icons/User";
import type { LocationPickerLatLng } from "@repo/ui/kit/LocationPickerMap";
import { useTranslations } from "next-intl";
import {
  PROFILE_GENDERS,
  composeAddressLine,
  isProfileGenderId,
  type ProfileMapPoint,
  type ProfileSettingsFormValues,
} from "@/modules/account/lib/profile-settings";
import { profileSettingsFormSectionVariants } from "./ProfileSettingsFormSection.styles";
import type { ProfileSettingsFormSectionProps } from "./ProfileSettingsFormSection.types";

const FIELD_ICON = 18;
const GENDER_ICONS = {
  female: GenderFemale,
  male: GenderMale,
  other: GenderTransgender,
} as const;

const LocationPickerMap = dynamic(
  () =>
    import("@repo/ui/kit/LocationPickerMap").then(
      (mod) => mod.LocationPickerMap,
    ),
  { ssr: false },
);

type AddressDraft = Pick<
  ProfileSettingsFormValues,
  "street" | "apartment" | "city" | "postalCode" | "mapPoint"
>;

export function ProfileSettingsFormSection({
  values,
  provinces,
  phoneDisplay,
  error,
  notice,
  isPending,
  onChange,
  onSubmit,
  className,
}: ProfileSettingsFormSectionProps) {
  const t = useTranslations("Mobile.ProfileSettings");
  const tProfile = useTranslations("Mobile.Profile");
  const styles = profileSettingsFormSectionVariants();
  const [addressOpen, setAddressOpen] = useState(false);
  const [draft, setDraft] = useState<AddressDraft>({
    street: values.street,
    apartment: values.apartment,
    city: values.city,
    postalCode: values.postalCode,
    mapPoint: values.mapPoint,
  });

  useEffect(() => {
    if (!addressOpen) return;
    setDraft({
      street: values.street,
      apartment: values.apartment,
      city: values.city,
      postalCode: values.postalCode,
      mapPoint: values.mapPoint,
    });
  }, [
    addressOpen,
    values.apartment,
    values.city,
    values.mapPoint,
    values.postalCode,
    values.street,
  ]);

  const provinceName =
    provinces.find((item) => item.id === values.provinceId)?.name ?? "";
  const addressLine = composeAddressLine({
    street: values.street,
    apartment: values.apartment,
    city: values.city,
    provinceName,
    postalCode: values.postalCode,
  });
  const GenderIcon = values.gender
    ? GENDER_ICONS[values.gender]
    : GenderFemale;
  const genderLabel =
    values.gender === "male"
      ? tProfile("genderMale")
      : values.gender === "female"
        ? tProfile("genderFemale")
        : values.gender === "other"
          ? tProfile("genderOther")
          : t("genderPlaceholder");

  const confirmAddress = () => {
    onChange(draft);
    setAddressOpen(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <>
      <form className={styles.root({ className })} onSubmit={handleSubmit}>
        <TextField
          className={styles.field()}
          fullWidth
          name="fullName"
          onChange={(next) => onChange({ fullName: next })}
          value={values.fullName}
        >
          <Label className={styles.label()}>{t("fullName")}</Label>
          <InputGroup className={styles.inputGroup()} variant="secondary">
            <InputGroup.Prefix>
              <User className={styles.icon()} size={FIELD_ICON} />
            </InputGroup.Prefix>
            <InputGroup.Input
              className={styles.input()}
              placeholder={t("fullNamePlaceholder")}
            />
          </InputGroup>
        </TextField>

        <Select
          className={styles.field()}
          fullWidth
          name="province"
          onChange={(key) => {
            if (typeof key === "string") onChange({ provinceId: key });
          }}
          placeholder={t("provincePlaceholder")}
          value={values.provinceId}
          variant="secondary"
        >
          <Label className={styles.label()}>{t("province")}</Label>
          <Select.Trigger className={styles.selectTrigger()}>
            <MapPin1 className={styles.icon()} size={FIELD_ICON} />
            <Select.Value className={styles.selectValue()} />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {provinces.map((item) => (
                <ListBox.Item id={item.id} key={item.id} textValue={item.name}>
                  {item.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          className={styles.field()}
          fullWidth
          name="gender"
          onChange={(key) => {
            if (typeof key === "string" && isProfileGenderId(key)) {
              onChange({ gender: key });
            }
          }}
          placeholder={t("genderPlaceholder")}
          value={values.gender || null}
          variant="secondary"
        >
          <Label className={styles.label()}>{t("gender")}</Label>
          <Select.Trigger className={styles.selectTrigger()}>
            <GenderIcon className={styles.icon()} size={FIELD_ICON} />
            <Select.Value className={styles.selectValue()}>
              {genderLabel}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {PROFILE_GENDERS.map((item) => {
                const label =
                  item === "male"
                    ? tProfile("genderMale")
                    : item === "female"
                      ? tProfile("genderFemale")
                      : tProfile("genderOther");
                return (
                  <ListBox.Item id={item} key={item} textValue={label}>
                    {label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
        </Select>

        <TextField
          className={styles.field()}
          fullWidth
          name="birthDate"
          onChange={(next) => onChange({ birthDateJalali: next })}
          value={values.birthDateJalali}
        >
          <Label className={styles.label()}>{t("birthDate")}</Label>
          <InputGroup className={styles.inputGroup()} variant="secondary">
            <InputGroup.Input
              className={styles.input()}
              inputMode="numeric"
              placeholder={t("birthDatePlaceholder")}
            />
            <InputGroup.Suffix>
              <Calendar1 className={styles.icon()} size={FIELD_ICON} />
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>

        <TextField
          className={styles.field()}
          fullWidth
          isReadOnly
          name="phone"
          value={phoneDisplay}
        >
          <Label className={styles.label()}>{t("phone")}</Label>
          <InputGroup className={styles.inputGroup()} variant="secondary">
            <InputGroup.Prefix>
              <span className={styles.phonePrefix()}>
                <Flag1 size={FIELD_ICON} />
                IR
              </span>
            </InputGroup.Prefix>
            <InputGroup.Input className={styles.input()} dir="ltr" />
            <InputGroup.Suffix>
              <span
                aria-label={t("phoneLocked")}
                className={styles.help()}
                title={t("phoneLocked")}
              >
                <InfoCircle size={14} />
              </span>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>

        <div className={styles.field()}>
          <Typography className={styles.label()}>{t("homeAddress")}</Typography>
          <Button
            className={styles.addressTrigger()}
            onPress={() => setAddressOpen(true)}
            type="button"
            variant="ghost"
          >
            <MapPin1 className={styles.icon()} size={FIELD_ICON} />
            <span
              className={
                addressLine ? styles.addressValue() : styles.addressPlaceholder()
              }
            >
              {addressLine || t("homeAddressPlaceholder")}
            </span>
          </Button>
        </div>

        {error ? (
          <Typography className={styles.error()} role="alert" type="body-sm">
            {error}
          </Typography>
        ) : null}
        {notice ? (
          <Typography className={styles.notice()} role="status" type="body-sm">
            {notice}
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
            {tProfile("updateProfile")}
            <Check size={18} />
          </Button>
        </div>
      </form>

      <Drawer.Backdrop
        isOpen={addressOpen}
        onOpenChange={(open) => {
          if (!open) setAddressOpen(false);
        }}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>{t("editAddressTitle")}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className={styles.drawerBody()}>
              <TextField
                className={styles.field()}
                fullWidth
                name="streetDraft"
                onChange={(next) => setDraft((current) => ({ ...current, street: next }))}
                value={draft.street}
              >
                <Label className={styles.label()}>{t("street")}</Label>
                <InputGroup className={styles.inputGroup()} variant="secondary">
                  <InputGroup.Prefix>
                    <MapPin1 className={styles.icon()} size={FIELD_ICON} />
                  </InputGroup.Prefix>
                  <InputGroup.Input className={styles.input()} />
                </InputGroup>
              </TextField>
              <div className={styles.mapShell()}>
                <LocationPickerMap
                  className={styles.mapCanvas()}
                  onChange={(point: LocationPickerLatLng) =>
                    setDraft((current) => ({
                      ...current,
                      mapPoint: point as ProfileMapPoint,
                    }))
                  }
                  value={draft.mapPoint}
                  zoomInLabel={t("zoomIn")}
                  zoomLabel={t("zoom")}
                  zoomOutLabel={t("zoomOut")}
                />
              </div>
              <TextField
                className={styles.field()}
                fullWidth
                name="cityDraft"
                onChange={(next) => setDraft((current) => ({ ...current, city: next }))}
                value={draft.city}
              >
                <Label className={styles.label()}>{t("city")}</Label>
                <Input className={styles.input()} />
              </TextField>
              <div className={styles.drawerRow()}>
                <TextField
                  className={styles.field()}
                  fullWidth
                  name="apartmentDraft"
                  onChange={(next) =>
                    setDraft((current) => ({ ...current, apartment: next }))
                  }
                  value={draft.apartment}
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
                  name="postalDraft"
                  onChange={(next) =>
                    setDraft((current) => ({ ...current, postalCode: next }))
                  }
                  value={draft.postalCode}
                >
                  <Label className={styles.label()}>{t("postalCode")}</Label>
                  <Input
                    className={styles.input()}
                    inputMode="numeric"
                    maxLength={10}
                  />
                </TextField>
              </div>
              <Button
                className={styles.selectBtn()}
                fullWidth
                onPress={confirmAddress}
                size="lg"
                variant="primary"
              >
                {t("confirmAddress")}
                <Check className={styles.selectIcon()} size={20} />
              </Button>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  );
}
