"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";
import { Input } from "@heroui/react/input";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Building1 } from "@repo/icons/Building1";
import { Check } from "@repo/icons/Check";
import { MapPin1 } from "@repo/icons/MapPin1";
import { User } from "@repo/icons/User";
import type { LocationPickerLatLng } from "@repo/ui/kit/LocationPickerMap";
import { HeightSlider } from "@repo/ui/kit/HeightSlider";
import { WeightSlider } from "@repo/ui/kit/WeightSlider";
import { useTranslations } from "next-intl";
import {
  ONBOARDING_HEIGHT_CM_RANGE,
  ONBOARDING_WEIGHT_KG_RANGE,
} from "@/modules/app/lib/onboarding-data";
import {
  PROFILE_GENDERS,
  calendarValueToJalaliDisplay,
  jalaliDisplayToCalendarValue,
  normalizeUserCode,
  type ProfileAddressFormValues,
  type ProfileJalaliDate,
  type ProfileMapPoint,
} from "@/modules/account/lib/profile-settings";
import { JalaliCalendar } from "@/shared/components/JalaliCalendar";
import { profileSettingsEditSheetVariants } from "./ProfileSettingsEditSheet.styles";
import type { ProfileSettingsEditSheetProps } from "./ProfileSettingsEditSheet.types";

const FIELD_ICON = 18;
const DEFAULT_HEIGHT = 170;
const DEFAULT_WEIGHT = 70;

const LocationPickerMap = dynamic(
  () =>
    import("@repo/ui/kit/LocationPickerMap").then(
      (mod) => mod.LocationPickerMap,
    ),
  { ssr: false },
);

export function ProfileSettingsEditSheet({
  kind,
  values,
  provinces,
  levelOptions,
  onClose,
  onChange,
  onPatchAthlete,
  onPatchCoach,
}: ProfileSettingsEditSheetProps) {
  const t = useTranslations("Mobile.ProfileSettings");
  const tProfile = useTranslations("Mobile.Profile");
  const tAthlete = useTranslations("Mobile.AthleteProfile");
  const tCoach = useTranslations("Mobile.CoachProfile");
  const styles = profileSettingsEditSheetVariants();

  const [firstName, setFirstName] = useState(values.name.first);
  const [lastName, setLastName] = useState(values.name.last);
  const [gender, setGender] = useState(values.gender);
  const [birthDate, setBirthDate] = useState<ProfileJalaliDate | null>(
    jalaliDisplayToCalendarValue(values.birthDateJalali),
  );
  const [code, setCode] = useState(values.code);
  const [provinceId, setProvinceId] = useState(values.address.provinceId);
  const [address, setAddress] = useState<ProfileAddressFormValues>(
    values.address,
  );
  const [bio, setBio] = useState(values.athlete?.bio ?? values.coach?.bio ?? "");
  const [levelKey, setLevelKey] = useState(
    values.athlete?.levelKey ?? values.coach?.levelKey ?? "",
  );
  const [heightCm, setHeightCm] = useState(
    Number(values.athlete?.heightCm) || DEFAULT_HEIGHT,
  );
  const [weightKg, setWeightKg] = useState(
    Number(values.athlete?.weightKg) || DEFAULT_WEIGHT,
  );
  const [headline, setHeadline] = useState(values.coach?.headline ?? "");
  const [years, setYears] = useState(values.coach?.years ?? "");

  useEffect(() => {
    if (!kind) return;
    setFirstName(values.name.first);
    setLastName(values.name.last);
    setGender(values.gender);
    setBirthDate(jalaliDisplayToCalendarValue(values.birthDateJalali));
    setCode(values.code);
    setProvinceId(values.address.provinceId);
    setAddress(values.address);
    setBio(values.athlete?.bio ?? values.coach?.bio ?? "");
    setLevelKey(values.athlete?.levelKey ?? values.coach?.levelKey ?? "");
    setHeightCm(Number(values.athlete?.heightCm) || DEFAULT_HEIGHT);
    setWeightKg(Number(values.athlete?.weightKg) || DEFAULT_WEIGHT);
    setHeadline(values.coach?.headline ?? "");
    setYears(values.coach?.years ?? "");
  }, [kind, values]);

  const title =
    kind === "name"
      ? t("editNameTitle")
      : kind === "gender"
        ? t("editGenderTitle")
        : kind === "birthDate"
          ? t("editBirthDateTitle")
          : kind === "code"
            ? t("editCodeTitle")
            : kind === "province"
              ? t("selectProvinceTitle")
              : kind === "address"
                ? t("editAddressTitle")
                : kind === "athleteBio" || kind === "coachBio"
                  ? tAthlete("bio")
                  : kind === "athleteLevel"
                    ? tAthlete("levelKey")
                    : kind === "coachLevel"
                      ? tCoach("levelKey")
                      : kind === "athleteBody"
                        ? t("editBodyTitle")
                        : kind === "coachExperience"
                          ? t("editExperienceTitle")
                          : "";

  const confirm = () => {
    if (kind === "name") {
      onChange({ name: { first: firstName.trim(), last: lastName.trim() } });
    } else if (kind === "gender") {
      onChange({ gender });
    } else if (kind === "birthDate") {
      onChange({
        birthDateJalali: birthDate
          ? calendarValueToJalaliDisplay(birthDate)
          : "",
      });
    } else if (kind === "code") {
      onChange({ code: normalizeUserCode(code) });
    } else if (kind === "province") {
      const selected = provinces.find((item) => item.id === provinceId);
      onChange({
        address: {
          ...values.address,
          provinceId,
          city: values.address.city || selected?.name || "",
        },
      });
    } else if (kind === "address") {
      onChange({ address });
    } else if (kind === "athleteBio") {
      onPatchAthlete({ bio: bio.trim() });
    } else if (kind === "athleteLevel") {
      onPatchAthlete({ levelKey });
    } else if (kind === "athleteBody") {
      onPatchAthlete({
        heightCm: String(heightCm),
        weightKg: String(weightKg),
      });
    } else if (kind === "coachBio") {
      onPatchCoach({ bio: bio.trim() });
    } else if (kind === "coachLevel") {
      onPatchCoach({ levelKey });
    } else if (kind === "coachExperience") {
      onPatchCoach({ headline: headline.trim(), years: years.trim() });
    }
    onClose();
  };

  return (
    <Drawer.Backdrop
      isOpen={kind != null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Content placement="bottom">
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>{title}</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body className={styles.body()}>
            {kind === "name" ? (
              <>
                <TextField
                  className={styles.field()}
                  fullWidth
                  name="firstName"
                  onChange={setFirstName}
                  value={firstName}
                >
                  <Label className={styles.label()}>{tProfile("firstName")}</Label>
                  <InputGroup className={styles.inputGroup()} variant="secondary">
                    <InputGroup.Prefix>
                      <User className={styles.icon()} size={FIELD_ICON} />
                    </InputGroup.Prefix>
                    <InputGroup.Input className={styles.input()} />
                  </InputGroup>
                </TextField>
                <TextField
                  className={styles.field()}
                  fullWidth
                  name="lastName"
                  onChange={setLastName}
                  value={lastName}
                >
                  <Label className={styles.label()}>{tProfile("lastName")}</Label>
                  <InputGroup className={styles.inputGroup()} variant="secondary">
                    <InputGroup.Input className={styles.input()} />
                  </InputGroup>
                </TextField>
              </>
            ) : null}

            {kind === "gender" ? (
              <div
                aria-label={t("editGenderTitle")}
                className={styles.wheel()}
                role="listbox"
              >
                {PROFILE_GENDERS.map((item) => {
                  const label =
                    item === "male"
                      ? tProfile("genderMale")
                      : item === "female"
                        ? tProfile("genderFemale")
                        : tProfile("genderOther");
                  return (
                    <Button size="lg"
                      aria-selected={gender === item}
                      className={styles.wheelItem()}
                      data-selected={gender === item || undefined}
                      key={item}
                      onPress={() => setGender(item)}
                      variant="ghost"
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            ) : null}

            {kind === "birthDate" ? (
              <JalaliCalendar
                aria-label={t("birthDate")}
                maxDate={new Date()}
                onChange={(next) => setBirthDate(next)}
                value={birthDate}
              />
            ) : null}

            {kind === "code" ? (
              <>
                <TextField
                  className={styles.field()}
                  fullWidth
                  name="code"
                  onChange={setCode}
                  value={code}
                >
                  <Label className={styles.label()}>{tProfile("code")}</Label>
                  <Input className={styles.input()} dir="ltr" />
                </TextField>
                <Typography className={styles.hint()} type="body-sm">
                  {t("codeHint")}
                </Typography>
              </>
            ) : null}

            {kind === "province" ? (
              <div
                aria-label={t("selectProvinceTitle")}
                className={styles.wheel()}
                role="listbox"
              >
                {provinces.map((item) => (
                  <Button size="lg"
                    aria-selected={provinceId === item.id}
                    className={styles.wheelItem()}
                    data-selected={provinceId === item.id || undefined}
                    key={item.id}
                    onPress={() => setProvinceId(item.id)}
                    variant="ghost"
                  >
                    {item.name}
                  </Button>
                ))}
              </div>
            ) : null}

            {kind === "address" ? (
              <>
                <TextField
                  className={styles.field()}
                  fullWidth
                  name="streetDraft"
                  onChange={(next) =>
                    setAddress((current) => ({ ...current, street: next }))
                  }
                  value={address.street}
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
                      setAddress((current) => ({
                        ...current,
                        mapPoint: point as ProfileMapPoint,
                      }))
                    }
                    value={address.mapPoint}
                    zoomInLabel={t("zoomIn")}
                    zoomOutLabel={t("zoomOut")}
                  />
                </div>
                <TextField
                  className={styles.field()}
                  fullWidth
                  name="cityDraft"
                  onChange={(next) =>
                    setAddress((current) => ({ ...current, city: next }))
                  }
                  value={address.city}
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
                      setAddress((current) => ({ ...current, apartment: next }))
                    }
                    value={address.apartment}
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
                      setAddress((current) => ({ ...current, postalCode: next }))
                    }
                    value={address.postalCode}
                  >
                    <Label className={styles.label()}>{t("postalCode")}</Label>
                    <Input
                      className={styles.input()}
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </TextField>
                </div>
              </>
            ) : null}

            {kind === "athleteBio" || kind === "coachBio" ? (
              <TextField
                className={styles.field()}
                fullWidth
                name="bioDraft"
                onChange={setBio}
                value={bio}
              >
                <Label className={styles.label()}>{tAthlete("bio")}</Label>
                <TextArea className={styles.input()} />
              </TextField>
            ) : null}

            {kind === "athleteLevel" || kind === "coachLevel" ? (
              levelOptions.length > 0 ? (
                <div
                  aria-label={title}
                  className={styles.wheel()}
                  role="listbox"
                >
                  {levelOptions.map((option) => (
                    <Button size="lg"
                      aria-selected={levelKey === option.value}
                      className={styles.wheelItem()}
                      data-selected={levelKey === option.value || undefined}
                      key={option.value}
                      onPress={() => setLevelKey(option.value)}
                      variant="ghost"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span>{option.name}</span>
                        {option.description ? (
                          <span className="text-xs font-normal text-muted">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <Typography className={styles.hint()} type="body-sm">
                  {t("levelEmpty")}
                </Typography>
              )
            ) : null}

            {kind === "athleteBody" ? (
              <>
                <div className={styles.sliderBlock()}>
                  <Typography className={styles.label()}>
                    {tAthlete("heightCm")}
                  </Typography>
                  <HeightSlider
                    aria-label={tAthlete("heightCm")}
                    max={ONBOARDING_HEIGHT_CM_RANGE.max}
                    min={ONBOARDING_HEIGHT_CM_RANGE.min}
                    onChange={setHeightCm}
                    value={heightCm}
                  />
                </div>
                <div className={styles.sliderBlock()}>
                  <Typography className={styles.label()}>
                    {tAthlete("weightKg")}
                  </Typography>
                  <WeightSlider
                    aria-label={tAthlete("weightKg")}
                    label={null}
                    max={ONBOARDING_WEIGHT_KG_RANGE.max}
                    min={ONBOARDING_WEIGHT_KG_RANGE.min}
                    onChange={setWeightKg}
                    value={weightKg}
                  />
                </div>
              </>
            ) : null}

            {kind === "coachExperience" ? (
              <>
                <TextField
                  className={styles.field()}
                  fullWidth
                  name="headlineDraft"
                  onChange={setHeadline}
                  value={headline}
                >
                  <Label className={styles.label()}>{tCoach("headline")}</Label>
                  <Input className={styles.input()} />
                </TextField>
                <TextField
                  className={styles.field()}
                  fullWidth
                  name="yearsDraft"
                  onChange={setYears}
                  value={years}
                >
                  <Label className={styles.label()}>{tCoach("years")}</Label>
                  <Input className={styles.input()} inputMode="numeric" />
                </TextField>
              </>
            ) : null}

            <Button
              className={styles.confirm()}
              fullWidth
              onPress={confirm}
              size="lg"
              variant="primary"
            >
              {kind === "address" ? t("confirmAddress") : t("confirm")}
              <Check className={styles.confirmIcon()} size={20} />
            </Button>
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
