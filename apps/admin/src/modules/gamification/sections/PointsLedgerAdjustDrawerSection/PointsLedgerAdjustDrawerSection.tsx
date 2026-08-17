import { Button, Input, Label, TextField } from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components";
import { SUBJECT_TYPES } from "../../lib/gamification-constants";
import { pointsLedgerAdjustDrawerSectionVariants } from "./PointsLedgerAdjustDrawerSection.styles";
import type { PointsLedgerAdjustDrawerSectionProps } from "./PointsLedgerAdjustDrawerSection.types";

export function PointsLedgerAdjustDrawerSection({
  isOpen,
  onOpenChange,
  subjectType,
  onSubjectTypeChange,
  subjectId,
  onSubjectIdChange,
  amount,
  onAmountChange,
  note,
  onNoteChange,
  canAdjust,
  pending,
  error,
  onConfirm,
  onCancel,
}: PointsLedgerAdjustDrawerSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointsLedgerAdjustDrawerSectionVariants();

  return (
    <AdminFormDrawer
      className="max-w-xl sm:max-w-xl"
      isOpen={isOpen}
      title={t("ledger.actions.adjustTitle")}
      onOpenChange={onOpenChange}
    >
      <div className={styles.form()}>
        <div className={styles.field()}>
          <Label>{t("achievements.fields.subjectType")}</Label>
          <div className={styles.chips()}>
            {SUBJECT_TYPES.map((value) => (
              <Button
                key={value}
                size="sm"
                variant={subjectType === value ? "primary" : "secondary"}
                onPress={() => onSubjectTypeChange(value)}
              >
                {t(`subjects.${value}`)}
              </Button>
            ))}
          </div>
        </div>

        <TextField
          className={styles.field()}
          fullWidth
          name="subjectId"
          value={subjectId}
          onChange={onSubjectIdChange}
        >
          <Label>{t("achievements.fields.subjectId")}</Label>
          <Input
            dir="ltr"
            placeholder={t("achievements.fields.subjectIdHint")}
          />
        </TextField>

        <TextField
          className={styles.field()}
          fullWidth
          name="amount"
          value={amount}
          onChange={onAmountChange}
        >
          <Label>{t("ledger.fields.amount")}</Label>
          <Input
            dir="ltr"
            inputMode="numeric"
            placeholder={t("ledger.fields.amountHint")}
          />
        </TextField>

        <TextField
          className={styles.field()}
          fullWidth
          name="note"
          value={note}
          onChange={onNoteChange}
        >
          <Label>{t("ledger.fields.note")}</Label>
          <Input placeholder={t("ledger.fields.noteHint")} />
        </TextField>

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.actions()}>
          <Button
            isDisabled={pending || !canAdjust}
            variant="primary"
            onPress={onConfirm}
          >
            {t("actions.save")}
          </Button>
          <Button isDisabled={pending} variant="secondary" onPress={onCancel}>
            {t("cancel")}
          </Button>
        </div>
      </div>
    </AdminFormDrawer>
  );
}
