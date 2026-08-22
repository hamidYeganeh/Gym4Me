"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Building1 } from "@repo/icons/Building1";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Check } from "@repo/icons/Check";
import { Flag1 } from "@repo/icons/Flag1";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { GenderMale } from "@repo/icons/GenderMale";
import { GenderTransgender } from "@repo/icons/GenderTransgender";
import { Gift } from "@repo/icons/Gift";
import { IdentityCard1 } from "@repo/icons/IdentityCard1";
import { MapPin1 } from "@repo/icons/MapPin1";
import { MedicalCard1 } from "@repo/icons/MedicalCard1";
import { Note1 } from "@repo/icons/Note1";
import { Ruler1 } from "@repo/icons/Ruler1";
import { SealCheck } from "@repo/icons/SealCheck";
import { User } from "@repo/icons/User";
import { UserCheck } from "@repo/icons/UserCheck";
import { useTranslations } from "next-intl";
import { ProfileSettingsFieldRow } from "@/modules/account/components/ProfileSettingsFieldRow";
import {
  composeAddressLine,
  joinFullName,
} from "@/modules/account/lib/profile-settings";
import { ProfileSettingsEditSheet } from "../ProfileSettingsEditSheet";
import type { ProfileSettingsSheetKind } from "../ProfileSettingsEditSheet";
import { profileSettingsFormSectionVariants } from "./ProfileSettingsFormSection.styles";
import type { ProfileSettingsFormSectionProps } from "./ProfileSettingsFormSection.types";

const FIELD_ICON = 18;
const GENDER_ICONS = {
  female: GenderFemale,
  male: GenderMale,
  other: GenderTransgender,
} as const;

export function ProfileSettingsFormSection({
  values,
  provinces,
  phoneDisplay,
  nationalIdDisplay,
  referralCodeDisplay,
  error,
  notice,
  isPending,
  onChange,
  onPatchAthlete,
  onPatchCoach,
  onSubmit,
  className,
}: ProfileSettingsFormSectionProps) {
  const t = useTranslations("Mobile.ProfileSettings");
  const tProfile = useTranslations("Mobile.Profile");
  const tAthlete = useTranslations("Mobile.AthleteProfile");
  const tCoach = useTranslations("Mobile.CoachProfile");
  const styles = profileSettingsFormSectionVariants();
  const [sheet, setSheet] = useState<ProfileSettingsSheetKind>(null);

  const provinceName =
    provinces.find((item) => item.id === values.address.provinceId)?.name ?? "";
  const addressLine = composeAddressLine({
    street: values.address.street,
    apartment: values.address.apartment,
    city: values.address.city,
    provinceName,
    postalCode: values.address.postalCode,
  });
  const fullName = joinFullName(values.name.first, values.name.last);
  const GenderIcon = values.gender ? GENDER_ICONS[values.gender] : GenderFemale;
  const genderLabel =
    values.gender === "male"
      ? tProfile("genderMale")
      : values.gender === "female"
        ? tProfile("genderFemale")
        : values.gender === "other"
          ? tProfile("genderOther")
          : "";
  const bodyLabel = [values.athlete?.heightCm, values.athlete?.weightKg]
    .filter(Boolean)
    .map((part, index) =>
      index === 0 ? `${part} ${t("cm")}` : `${part} ${t("kg")}`,
    )
    .join(" · ");
  const experienceLabel = [values.coach?.headline, values.coach?.years]
    .filter(Boolean)
    .join(" · ");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <>
      <form className={styles.root({ className })} onSubmit={handleSubmit}>
        <section className={styles.section()}>
          <div className={styles.sectionHead()}>
            <User aria-hidden className={styles.sectionIcon()} size={20} />
            <Typography className={styles.sectionTitle()}>
              {t("sectionPersonal")}
            </Typography>
          </div>
          <ProfileSettingsFieldRow
            icon={<User size={FIELD_ICON} />}
            label={t("name")}
            onPress={() => setSheet("name")}
            placeholder={t("namePlaceholder")}
            value={fullName}
          />
          <ProfileSettingsFieldRow
            icon={<GenderIcon size={FIELD_ICON} />}
            label={t("gender")}
            onPress={() => setSheet("gender")}
            placeholder={t("genderPlaceholder")}
            value={genderLabel}
          />
          <ProfileSettingsFieldRow
            icon={<Calendar1 size={FIELD_ICON} />}
            label={t("birthDate")}
            onPress={() => setSheet("birthDate")}
            placeholder={t("birthDatePlaceholder")}
            value={values.birthDateJalali}
          />
          <ProfileSettingsFieldRow
            icon={<UserCheck size={FIELD_ICON} />}
            label={tProfile("code")}
            onPress={() => setSheet("code")}
            placeholder={t("codePlaceholder")}
            value={values.code}
            valueDir="ltr"
          />
        </section>

        <section className={styles.section()}>
          <div className={styles.sectionHead()}>
            <IdentityCard1 aria-hidden className={styles.sectionIcon()} size={20} />
            <Typography className={styles.sectionTitle()}>
              {t("sectionContact")}
            </Typography>
          </div>
          <ProfileSettingsFieldRow
            icon={
              <span className={styles.phonePrefix()}>
                <Flag1 size={FIELD_ICON} />
                IR
              </span>
            }
            label={t("phone")}
            locked
            lockedAriaLabel={t("phoneLocked")}
            placeholder={t("phonePlaceholder")}
            value={phoneDisplay}
            valueDir="ltr"
          />
          <ProfileSettingsFieldRow
            icon={<IdentityCard1 size={FIELD_ICON} />}
            label={t("nationalId")}
            locked
            lockedAriaLabel={t("nationalIdLocked")}
            placeholder={t("nationalIdEmpty")}
            value={nationalIdDisplay}
            valueDir="ltr"
          />
          <ProfileSettingsFieldRow
            icon={<Gift size={FIELD_ICON} />}
            label={t("referralCode")}
            locked
            lockedAriaLabel={t("referralLocked")}
            placeholder={t("referralEmpty")}
            value={referralCodeDisplay}
            valueDir="ltr"
          />
        </section>

        <section className={styles.section()}>
          <div className={styles.sectionHead()}>
            <Building1 aria-hidden className={styles.sectionIcon()} size={20} />
            <Typography className={styles.sectionTitle()}>
              {t("sectionAddress")}
            </Typography>
          </div>
          <ProfileSettingsFieldRow
            icon={<MapPin1 size={FIELD_ICON} />}
            label={t("province")}
            onPress={() => setSheet("province")}
            placeholder={t("provincePlaceholder")}
            value={provinceName}
          />
          <ProfileSettingsFieldRow
            icon={<MapPin1 size={FIELD_ICON} />}
            label={t("homeAddress")}
            multiline
            onPress={() => setSheet("address")}
            placeholder={t("homeAddressPlaceholder")}
            value={addressLine}
          />
        </section>

        {values.athlete ? (
          <section className={styles.section()}>
            <div className={styles.sectionHead()}>
              <MedicalCard1 aria-hidden className={styles.sectionIcon()} size={20} />
              <Typography className={styles.sectionTitle()}>
                {t("sectionAthlete")}
              </Typography>
            </div>
            <ProfileSettingsFieldRow
              icon={<Note1 size={FIELD_ICON} />}
              label={tAthlete("bio")}
              multiline
              onPress={() => setSheet("athleteBio")}
              placeholder={t("bioPlaceholder")}
              value={values.athlete.bio}
            />
            <ProfileSettingsFieldRow
              icon={<SealCheck size={FIELD_ICON} />}
              label={tAthlete("levelKey")}
              onPress={() => setSheet("athleteLevel")}
              placeholder={t("levelPlaceholder")}
              value={values.athlete.levelKey}
            />
            <ProfileSettingsFieldRow
              icon={<Ruler1 size={FIELD_ICON} />}
              label={t("body")}
              onPress={() => setSheet("athleteBody")}
              placeholder={t("bodyPlaceholder")}
              value={bodyLabel}
            />
          </section>
        ) : null}

        {values.coach ? (
          <section className={styles.section()}>
            <div className={styles.sectionHead()}>
              <SealCheck aria-hidden className={styles.sectionIcon()} size={20} />
              <Typography className={styles.sectionTitle()}>
                {t("sectionCoach")}
              </Typography>
            </div>
            <ProfileSettingsFieldRow
              icon={<Note1 size={FIELD_ICON} />}
              label={tCoach("bio")}
              multiline
              onPress={() => setSheet("coachBio")}
              placeholder={t("bioPlaceholder")}
              value={values.coach.bio}
            />
            <ProfileSettingsFieldRow
              icon={<SealCheck size={FIELD_ICON} />}
              label={t("experience")}
              onPress={() => setSheet("coachExperience")}
              placeholder={t("experiencePlaceholder")}
              value={experienceLabel}
            />
          </section>
        ) : null}

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

      <ProfileSettingsEditSheet
        kind={sheet}
        onChange={onChange}
        onClose={() => setSheet(null)}
        onPatchAthlete={onPatchAthlete}
        onPatchCoach={onPatchCoach}
        provinces={provinces}
        values={values}
      />
    </>
  );
}
