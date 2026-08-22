import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import type { PayoutRecipientType, PayoutStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
import { payoutsListFiltersSectionVariants } from "./PayoutsListFiltersSection.styles";
import {
  PAYOUT_RECIPIENT_TYPES,
  type PayoutsListFiltersSectionProps,
} from "./PayoutsListFiltersSection.types";

const PAYOUT_STATUSES: PayoutStatus[] = [
  "pending",
  "processing",
  "settled",
  "disputed",
  "cancelled",
];

export function PayoutsListFiltersSection({
  statusFilter,
  recipientTypeFilter,
  recipientId,
  clubId,
  onStatusChange,
  onRecipientTypeChange,
  onRecipientIdChange,
  onClubIdChange,
  className,
}: PayoutsListFiltersSectionProps) {
  const t = useTranslations("Admin.Finance");
  const styles = payoutsListFiltersSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <AdminFilterSelect
        allLabel={t("filterAll")}
        label={t("filters.status")}
        options={PAYOUT_STATUSES.map((item) => ({
          value: item,
          label: t(`payoutStatus.${item}`),
        }))}
        value={statusFilter}
        onChange={(value) => onStatusChange(value as typeof statusFilter)}
      />
      <AdminFilterSelect
        allLabel={t("filterAll")}
        label={t("filters.recipientType")}
        options={PAYOUT_RECIPIENT_TYPES.map((item) => ({
          value: item,
          label: t(`payoutRecipientType.${item}`),
        }))}
        value={recipientTypeFilter}
        onChange={(value) =>
          onRecipientTypeChange(value as PayoutRecipientType | "all")
        }
      />
      <TextField
        className={styles.field()}
        name="recipientId"
        value={recipientId}
        onChange={onRecipientIdChange}
      >
        <Label className={styles.label()}>{t("filters.recipientId")}</Label>
        <Input
          className={styles.input()}
          dir="ltr"
          placeholder={t("filters.idPlaceholder")}
        />
      </TextField>
      <TextField
        className={styles.field()}
        name="clubId"
        value={clubId}
        onChange={onClubIdChange}
      >
        <Label className={styles.label()}>{t("filters.clubId")}</Label>
        <Input
          className={styles.input()}
          dir="ltr"
          placeholder={t("filters.idPlaceholder")}
        />
      </TextField>
    </div>
  );
}
