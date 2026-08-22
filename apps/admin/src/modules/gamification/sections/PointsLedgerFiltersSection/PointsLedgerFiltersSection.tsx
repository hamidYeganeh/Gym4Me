import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import type {
  GamificationSubjectType,
  PointTransactionReason,
} from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
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
        onChange={(value) =>
          onSubjectChange(value as GamificationSubjectType | "all")
        }
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
      <TextField
        className={styles.field()}
        name="subjectId"
        value={subjectId}
        onChange={onSubjectIdChange}
      >
        <Label className={styles.label()}>{t("filters.subjectId")}</Label>
        <Input
          className={styles.input()}
          dir="ltr"
          placeholder={t("filters.idPlaceholder")}
        />
      </TextField>
      <TextField
        className={styles.field()}
        name="ruleId"
        value={ruleId}
        onChange={onRuleIdChange}
      >
        <Label className={styles.label()}>{t("filters.ruleId")}</Label>
        <Input
          className={styles.input()}
          dir="ltr"
          placeholder={t("filters.idPlaceholder")}
        />
      </TextField>
    </section>
  );
}
