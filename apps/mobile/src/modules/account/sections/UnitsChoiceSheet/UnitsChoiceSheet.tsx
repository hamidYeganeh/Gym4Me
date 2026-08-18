"use client";

import { Radio } from "@heroui/react/radio";
import { RadioGroup } from "@heroui/react/radio-group";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { FilterPanel } from "@repo/ui/kit/FilterPanel";
import { useTranslations } from "next-intl";
import { unitsChoiceSheetVariants } from "./UnitsChoiceSheet.styles";
import type { UnitsChoiceSheetProps } from "./UnitsChoiceSheet.types";

export function UnitsChoiceSheet({
  group,
  value,
  icon,
  isPending,
  error,
  onChange,
  onApply,
  onOpenChange,
}: UnitsChoiceSheetProps) {
  const t = useTranslations("Mobile.UnitsSettings");
  const styles = unitsChoiceSheetVariants();
  const isOpen = group != null;
  const selected = group?.options.find((option) => option.value === value);
  const canApply = Boolean(selected?.isActive);

  return (
    <FilterPanel
      closeLabel={t("close")}
      closeOnSubmit={false}
      description={
        group?.description?.trim() || t("sheetFallbackDescription")
      }
      isOpen={isOpen}
      isPending={isPending}
      isSubmitDisabled={!canApply}
      onOpenChange={onOpenChange}
      onSubmit={onApply}
      submitIcon={<Check size={18} />}
      submitLabel={t("apply")}
      title={group?.name ?? t("title")}
    >
      {group ? (
        <RadioGroup
          aria-label={group.name}
          className={styles.group()}
          name={`unit-${group.value}`}
          onChange={onChange}
          value={value ?? ""}
          variant="secondary"
        >
          {group.options.map((option) => {
            const disabled = option.isActive === false;
            return (
              <Radio
                className={styles.radio()}
                isDisabled={disabled}
                key={option.value}
                value={option.value}
              >
                <Radio.Content
                  className={({ isSelected, isDisabled }) =>
                    unitsChoiceSheetVariants({
                      selected: isSelected,
                      disabled: isDisabled,
                    }).row()
                  }
                >
                  <span aria-hidden className={styles.icon()}>
                    {icon}
                  </span>
                  <span className={styles.label()}>{option.name}</span>
                  <Radio.Control className={styles.control()}>
                    <Radio.Indicator />
                  </Radio.Control>
                </Radio.Content>
              </Radio>
            );
          })}
        </RadioGroup>
      ) : null}
      {error ? (
        <Typography className={styles.error()} role="alert" type="body-sm">
          {error}
        </Typography>
      ) : null}
    </FilterPanel>
  );
}
