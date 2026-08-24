import type {
  GamificationSubjectType,
  PointTransactionReason,
} from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect, AdminModelAutocomplete } from "@/shared/components";
import { SUBJECT_TYPES } from "../../lib/gamification-constants";
import { pointsLedgerFiltersSectionVariants } from "./PointsLedgerFiltersSection.styles";
import {
  POINT_LEDGER_REASONS,
  type PointsLedgerFiltersSectionProps,
} from "./PointsLedgerFiltersSection.types";

export function PointsLedgerFiltersSection({
  subjectFilter,
  reasonFilter,
  subjectId,
  ruleId,
  onSubjectChange,
  onReasonChange,
  onSubjectIdChange,
  onRuleIdChange,
  className,
}: PointsLedgerFiltersSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointsLedgerFiltersSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <AdminFilterSelect
        allLabel={t("filterAll")}
        label={t("filters.subjectType")}
        options={SUBJECT_TYPES.map((item) => ({
          value: item,
          label: t(`subjects.${item}`),
        }))}
        value={subjectFilter}
        onChange={(value) => {
          onSubjectChange(value as GamificationSubjectType | "all");
          onSubjectIdChange("");
        }}
      />
      <AdminFilterSelect
        allLabel={t("filterAllReasons")}
        label={t("filters.reason")}
        options={POINT_LEDGER_REASONS.map((item) => ({
          value: item,
          label: t(`reasons.${item}`),
        }))}
        value={reasonFilter}
        onChange={(value) =>
          onReasonChange(value as PointTransactionReason | "all")
        }
      />
      <AdminModelAutocomplete
        className={styles.field()}
        isDisabled={subjectFilter === "all"}
        kind={
          subjectFilter === "club"
            ? "club"
            : subjectFilter === "coach"
              ? "coach"
              : "athlete"
        }
        label={t("filters.subjectId")}
        value={subjectId}
        onChange={onSubjectIdChange}
      />
      <AdminModelAutocomplete
        className={styles.field()}
        kind="pointRule"
        label={t("filters.ruleId")}
        value={ruleId}
        onChange={onRuleIdChange}
      />
    </section>
  );
}
