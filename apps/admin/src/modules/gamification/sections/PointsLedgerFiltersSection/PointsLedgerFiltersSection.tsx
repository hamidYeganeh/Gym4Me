import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { SUBJECT_TYPES } from "../../lib/gamification-constants";
import { pointsLedgerFiltersSectionVariants } from "./PointsLedgerFiltersSection.styles";
import {
  POINT_LEDGER_REASONS,
  type PointsLedgerFiltersSectionProps,
} from "./PointsLedgerFiltersSection.types";

export function PointsLedgerFiltersSection({
  subjectFilter,
  reasonFilter,
  onSubjectChange,
  onReasonChange,
  className,
}: PointsLedgerFiltersSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointsLedgerFiltersSectionVariants();

  return (
    <section className={styles.root({ className })}>
      {(["all", ...SUBJECT_TYPES] as const).map((value) => (
        <FilterChip
          key={value}
          onPress={() => onSubjectChange(value)}
          selected={subjectFilter === value}
        >
          {value === "all" ? t("filterAll") : t(`subjects.${value}`)}
        </FilterChip>
      ))}
      {(["all", ...POINT_LEDGER_REASONS] as const).map((value) => (
        <FilterChip
          key={`reason-${value}`}
          onPress={() => onReasonChange(value)}
          selected={reasonFilter === value}
        >
          {value === "all" ? t("filterAllReasons") : t(`reasons.${value}`)}
        </FilterChip>
      ))}
    </section>
  );
}
