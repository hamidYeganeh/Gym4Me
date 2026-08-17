import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import {
  PROGRAM_FILTER_LABEL_KEY,
  PROGRAM_FILTERS,
} from "./CoachProgramsFiltersSection.types";
import { coachProgramsFiltersSectionVariants } from "./CoachProgramsFiltersSection.styles";
import type { CoachProgramsFiltersSectionProps } from "./CoachProgramsFiltersSection.types";

export function CoachProgramsFiltersSection({
  filter,
  onFilterChange,
  className,
}: CoachProgramsFiltersSectionProps) {
  const t = useTranslations("CoachPrograms");
  const styles = coachProgramsFiltersSectionVariants();

  return (
    <FilterChipBar
      aria-label={t("filtersLabel")}
      className={styles.root({ className })}
    >
      {PROGRAM_FILTERS.map((item) => (
        <FilterChip
          key={item}
          onPress={() => onFilterChange(item)}
          selected={filter === item}
        >
          {t(PROGRAM_FILTER_LABEL_KEY[item])}
        </FilterChip>
      ))}
    </FilterChipBar>
  );
}
