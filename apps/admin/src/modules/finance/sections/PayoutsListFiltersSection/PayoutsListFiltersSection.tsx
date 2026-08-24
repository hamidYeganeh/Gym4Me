import type { PayoutRecipientType, PayoutStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFilterSelect, AdminModelAutocomplete } from "@/shared/components";
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
        onChange={(value) => {
          onRecipientTypeChange(value as PayoutRecipientType | "all");
          onRecipientIdChange("");
        }}
      />
      <AdminModelAutocomplete
        className={styles.field()}
        isDisabled={recipientTypeFilter === "all"}
        kind={
          recipientTypeFilter === "club"
            ? "club"
            : recipientTypeFilter === "coach"
              ? "coach"
              : "user"
        }
        label={t("filters.recipientId")}
        value={recipientId}
        onChange={onRecipientIdChange}
      />
      <AdminModelAutocomplete
        className={styles.field()}
        kind="club"
        label={t("filters.clubId")}
        value={clubId}
        onChange={onClubIdChange}
      />
    </div>
  );
}
