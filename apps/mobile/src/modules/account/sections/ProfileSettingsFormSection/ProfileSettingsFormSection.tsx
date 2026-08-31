"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Check } from "@repo/icons/Check";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { GenderMale } from "@repo/icons/GenderMale";
import { GenderTransgender } from "@repo/icons/GenderTransgender";
import { Gift } from "@repo/icons/Gift";
import { IdentityCard1 } from "@repo/icons/IdentityCard1";
import { InfoCircle } from "@repo/icons/InfoCircle";
import { MedicalCard1 } from "@repo/icons/MedicalCard1";
import { Note1 } from "@repo/icons/Note1";
import { SealCheck } from "@repo/icons/SealCheck";
import { User } from "@repo/icons/User";
import { UserCheck } from "@repo/icons/UserCheck";
import { IranFlag } from "@repo/ui/common/Flag";
import { useTranslations } from "next-intl";
import { ProfileSettingsFieldRow } from "@/modules/account/components/ProfileSettingsFieldRow";
import { joinFullName } from "@/modules/account/lib/profile-settings";
import { useRouter } from "@/shared/lib/app-router";
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
  levelOptions,
  phoneDisplay,
  nationalIdDisplay,
  referralCodeDisplay,
  roleSegment = "athlete",
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
  const router = useRouter();
  const [sheet, setSheet] = useState<ProfileSettingsSheetKind>(null);

  const levelLabel = (key: string) =>
    levelOptions.find((option) => option.value === key)?.name ?? key;
  const athleteLevelLabel = values.athlete?.levelKey
    ? levelLabel(values.athlete.levelKey)
    : "";
  const coachLevelLabel = values.coach?.levelKey
    ? levelLabel(values.coach.levelKey)
    : "";
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
            onPress={() =>
              router.push(`/${roleSegment}/profile/edit/gender`)
            }
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
          <div className={styles.phoneField()}>
            <Typography className={styles.phoneLabel()}>{t("phone")}</Typography>
            <div
              aria-label={t("phoneLocked")}
              className={styles.phoneTrigger()}
              dir="ltr"
              lang="en"
              title={t("phoneLocked")}
            >
              <span className={styles.phoneCountry()}>
                <span className={styles.phoneFlag()}>
                  <IranFlag size="lg" />
                </span>
                <span aria-hidden className={styles.phoneDivider()} />
                <span className={styles.phoneCode()}>+98</span>
              </span>
              <span className={styles.phoneValue()}>
                {phoneDisplay || t("phonePlaceholder")}
              </span>
              <span
                aria-label={t("phoneLocked")}
                className={styles.phoneHelp()}
                title={t("phoneLocked")}
              >
                <InfoCircle size={14} />
              </span>
            </div>
          </div>
          <ProfileSettingsFieldRow
            icon={<IdentityCard1 size={FIELD_ICON} />}
            label={t("nationalId")}
            locked
            lockedAriaLabel={t("nationalIdLocked")}
            onPress={() => router.push(`/${roleSegment}/kyc`)}
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
              value={athleteLevelLabel}
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
              label={tCoach("levelKey")}
              onPress={() => setSheet("coachLevel")}
              placeholder={t("levelPlaceholder")}
              value={coachLevelLabel}
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
        levelOptions={levelOptions}
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
