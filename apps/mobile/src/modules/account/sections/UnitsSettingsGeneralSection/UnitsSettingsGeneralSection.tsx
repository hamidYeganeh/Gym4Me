import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { UnitsMetricCard } from "@/modules/account/components/UnitsMetricCard";
import {
  optionLabel,
  resolveUnitValue,
  unitIconKey,
} from "@/modules/account/lib/units-settings";
import { unitsSettingsGeneralSectionVariants } from "./UnitsSettingsGeneralSection.styles";
import type { UnitsSettingsGeneralSectionProps } from "./UnitsSettingsGeneralSection.types";

export function UnitsSettingsGeneralSection({
  groups,
  units,
  icons,
  fallbackIcon,
  onSelect,
  isLoading = false,
  className,
}: UnitsSettingsGeneralSectionProps) {
  const t = useTranslations("Mobile.UnitsSettings");
  const styles = unitsSettingsGeneralSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="body">
        {t("general")}
      </Typography>
      <div className={styles.grid()}>
        {isLoading
          ? null
          : groups.map((group) => {
              const iconKey = unitIconKey(group.value);
              const selected = resolveUnitValue(units[group.value], group.options);
              return (
                <UnitsMetricCard
                  icon={(iconKey ? icons[iconKey] : null) ?? fallbackIcon}
                  isDisabled={group.options.length === 0}
                  key={group.value}
                  label={group.name}
                  onPress={() => onSelect(group)}
                  value={optionLabel(group.options, selected)}
                />
              );
            })}
      </div>
    </section>
  );
}
