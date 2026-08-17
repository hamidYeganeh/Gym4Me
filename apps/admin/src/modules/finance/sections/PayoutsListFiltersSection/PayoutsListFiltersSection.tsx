import type { PayoutStatus } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { payoutsListFiltersSectionVariants } from "./PayoutsListFiltersSection.styles";
import type { PayoutsListFiltersSectionProps } from "./PayoutsListFiltersSection.types";

const STATUSES: Array<PayoutStatus | "all"> = [
  "all",
  "pending",
  "processing",
  "settled",
  "disputed",
  "cancelled",
];

export function PayoutsListFiltersSection({
  statusFilter,
  onStatusChange,
  className,
}: PayoutsListFiltersSectionProps) {
  const t = useTranslations("Admin.Finance");
  const styles = payoutsListFiltersSectionVariants();

  return (
    <div className={styles.root({ className })}>
      {STATUSES.map((status) => (
        <FilterChip
          key={status}
          onPress={() => onStatusChange(status)}
          selected={statusFilter === status}
        >
          {status === "all" ? t("filterAll") : status}
        </FilterChip>
      ))}
    </div>
  );
}
