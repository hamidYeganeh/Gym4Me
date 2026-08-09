"use client";

import { useState } from "react";
import { Input, Label, TextField, Typography } from "@heroui/react";
import type { OperatingHourAudience } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import {
  AGE_GROUP_OPTIONS,
  GENDER_POLICY_OPTIONS,
  WEEKDAY_KEYS,
  hoursForAudience,
} from "../../lib/club-create-form";
import { ownerClubsCreateHoursSectionVariants } from "./OwnerClubsCreateHoursSection.styles";
import type { OwnerClubsCreateHoursSectionProps } from "./OwnerClubsCreateHoursSection.types";

export function OwnerClubsCreateHoursSection({
  genderPolicy,
  ageGroupKeys,
  hoursMode,
  operatingHours,
  onGenderPolicyChange,
  onHoursModeChange,
  onToggleAgeGroup,
  onHourStatusChange,
  onHourTimeChange,
  className,
}: OwnerClubsCreateHoursSectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateHoursSectionVariants();
  const [activeAudience, setActiveAudience] =
    useState<Exclude<OperatingHourAudience, "shared">>("male");

  const genderLabels: Record<(typeof GENDER_POLICY_OPTIONS)[number], string> = {
    mixed: t("genderMixed"),
    male_only: t("genderMaleOnly"),
    female_only: t("genderFemaleOnly"),
  };

  const ageLabels: Record<(typeof AGE_GROUP_OPTIONS)[number], string> = {
    kids: t("ageKids"),
    teens: t("ageTeens"),
    adults: t("ageAdults"),
    seniors: t("ageSeniors"),
  };

  const isMixed = genderPolicy === "mixed";
  const isSplit = isMixed && hoursMode === "gender_split";
  const editAudience: OperatingHourAudience = isSplit
    ? activeAudience
    : "shared";
  const visibleHours = hoursForAudience(operatingHours, editAudience);

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="bold">
          {t("stepHours")}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {t("stepHoursHint")}
        </Typography>
      </div>

      <div className={styles.group()}>
        <Typography className={styles.groupTitle()} type="body" weight="semibold">
          {t("genderPolicy")}
        </Typography>
        <div className={styles.chips()}>
          {GENDER_POLICY_OPTIONS.map((option) => (
            <FilterChip
              key={option}
              selected={genderPolicy === option}
              onPress={() => onGenderPolicyChange(option)}
            >
              {genderLabels[option]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className={styles.group()}>
        <Typography className={styles.groupTitle()} type="body" weight="semibold">
          {t("ageGroups")}
        </Typography>
        <div className={styles.chips()}>
          {AGE_GROUP_OPTIONS.map((option) => (
            <FilterChip
              key={option}
              selected={ageGroupKeys.includes(option)}
              onPress={() => onToggleAgeGroup(option)}
            >
              {ageLabels[option]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className={styles.group()}>
        <Typography className={styles.groupTitle()} type="body" weight="semibold">
          {t("operatingHours")}
        </Typography>

        {isMixed ? (
          <div className={styles.chips()}>
            <FilterChip
              selected={hoursMode === "unified"}
              onPress={() => onHoursModeChange("unified")}
            >
              {t("hoursModeUnified")}
            </FilterChip>
            <FilterChip
              selected={hoursMode === "gender_split"}
              onPress={() => onHoursModeChange("gender_split")}
            >
              {t("hoursModeGenderSplit")}
            </FilterChip>
          </div>
        ) : null}

        {isSplit ? (
          <div className={styles.chips()}>
            <FilterChip
              selected={activeAudience === "male"}
              onPress={() => setActiveAudience("male")}
            >
              {t("hoursAudienceMale")}
            </FilterChip>
            <FilterChip
              selected={activeAudience === "female"}
              onPress={() => setActiveAudience("female")}
            >
              {t("hoursAudienceFemale")}
            </FilterChip>
          </div>
        ) : null}

        <div className={styles.hoursList()}>
          {visibleHours.map((hour) => {
            const dayKey = WEEKDAY_KEYS[hour.weekday] ?? "sat";
            return (
              <div
                className={styles.hourRow()}
                key={`${hour.audience}-${hour.weekday}`}
              >
                <div className={styles.hourTop()}>
                  <Typography
                    className={styles.dayLabel()}
                    type="body"
                    weight="semibold"
                  >
                    {t(`weekdays.${dayKey}`)}
                  </Typography>
                  <div className={styles.chips()}>
                    <FilterChip
                      selected={hour.status === "open"}
                      onPress={() =>
                        onHourStatusChange(hour.weekday, editAudience, "open")
                      }
                    >
                      {t("dayOpen")}
                    </FilterChip>
                    <FilterChip
                      selected={hour.status === "closed"}
                      onPress={() =>
                        onHourStatusChange(hour.weekday, editAudience, "closed")
                      }
                    >
                      {t("dayClosed")}
                    </FilterChip>
                  </div>
                </div>
                {hour.status === "open" ? (
                  <div className={styles.timeRow()}>
                    <TextField
                      className={styles.field()}
                      fullWidth
                      name={`open-${editAudience}-${hour.weekday}`}
                      value={hour.open}
                      onChange={(value) =>
                        onHourTimeChange(
                          hour.weekday,
                          editAudience,
                          "open",
                          value,
                        )
                      }
                    >
                      <Label>{t("openTime")}</Label>
                      <Input type="time" />
                    </TextField>
                    <TextField
                      className={styles.field()}
                      fullWidth
                      name={`close-${editAudience}-${hour.weekday}`}
                      value={hour.close}
                      onChange={(value) =>
                        onHourTimeChange(
                          hour.weekday,
                          editAudience,
                          "close",
                          value,
                        )
                      }
                    >
                      <Label>{t("closeTime")}</Label>
                      <Input type="time" />
                    </TextField>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
