"use client";

import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import {
  COACH_RESERVE_MEDICAL_CONDITION_KEYS,
  COACH_RESERVE_NOTE_MAX,
  COACH_RESERVE_SUPPLEMENT_KEYS,
  toggleCoachReserveKey,
} from "../../lib/use-discovery-coaches-reserve";
import { discoveryCoachesReserveInfoStepSectionVariants as styles } from "./DiscoveryCoachesReserveInfoStepSection.styles";
import type { DiscoveryCoachesReserveInfoStepSectionProps } from "./DiscoveryCoachesReserveInfoStepSection.types";

export function DiscoveryCoachesReserveInfoStepSection({
  fullName,
  onFullNameChange,
  phone,
  onPhoneChange,
  note,
  onNoteChange,
  conditionKeys,
  onConditionKeysChange,
  supplementKeys,
  onSupplementKeysChange,
}: DiscoveryCoachesReserveInfoStepSectionProps) {
  const t = useTranslations("CoachReserve");
  const slots = styles();

  return (
    <>
      <section className={slots.section()}>
        <Typography
          className={slots.sectionTitle()}
          type="h4"
          weight="semibold"
        >
          {t("infoTitle")}
        </Typography>
        <div className={slots.fields()}>
          <TextField
            fullWidth
            name="fullName"
            onChange={onFullNameChange}
            value={fullName}
          >
            <Label>{t("fullName")}</Label>
            <Input />
          </TextField>
          <TextField
            fullWidth
            isDisabled={Boolean(phone)}
            name="phone"
            onChange={onPhoneChange}
            value={phone}
          >
            <Label>{t("phone")}</Label>
            <Input dir="ltr" inputMode="tel" />
          </TextField>
        </div>
      </section>

      <section className={slots.section()}>
        <Typography
          className={slots.sectionTitle()}
          type="h4"
          weight="semibold"
        >
          {t("conditionsTitle")}
        </Typography>
        <Typography className={slots.sectionHint()} type="body-sm">
          {t("conditionsHint")}
        </Typography>
        <FilterChipBar aria-label={t("conditionsTitle")}>
          {COACH_RESERVE_MEDICAL_CONDITION_KEYS.map((key) => (
            <FilterChip
              key={key}
              onPress={() =>
                onConditionKeysChange(toggleCoachReserveKey(conditionKeys, key))
              }
              selected={conditionKeys.includes(key)}
            >
              {t(`conditions.${key}`)}
            </FilterChip>
          ))}
        </FilterChipBar>
      </section>

      <section className={slots.section()}>
        <Typography
          className={slots.sectionTitle()}
          type="h4"
          weight="semibold"
        >
          {t("supplementsTitle")}
        </Typography>
        <FilterChipBar aria-label={t("supplementsTitle")}>
          {COACH_RESERVE_SUPPLEMENT_KEYS.map((key) => (
            <FilterChip
              key={key}
              onPress={() =>
                onSupplementKeysChange(toggleCoachReserveKey(supplementKeys, key))
              }
              selected={supplementKeys.includes(key)}
            >
              {t(`supplements.${key}`)}
            </FilterChip>
          ))}
        </FilterChipBar>
      </section>

      <section className={slots.section()}>
        <TextField
          fullWidth
          name="note"
          onChange={(value) => onNoteChange(value.slice(0, COACH_RESERVE_NOTE_MAX))}
          value={note}
        >
          <Label>{t("noteLabel")}</Label>
          <Input placeholder={t("notePlaceholder")} />
        </TextField>
        <Typography className={slots.noteCount()} type="body-xs">
          {t("noteCount", { count: note.length, max: COACH_RESERVE_NOTE_MAX })}
        </Typography>
      </section>
    </>
  );
}
