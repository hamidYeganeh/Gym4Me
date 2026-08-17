import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { bookingsListFiltersSectionVariants } from "./BookingsListFiltersSection.styles";
import {
  BOOKING_STATUS_FILTERS,
  type BookingsListFiltersSectionProps,
} from "./BookingsListFiltersSection.types";

export function BookingsListFiltersSection({
  statusFilter,
  onStatusChange,
  className,
}: BookingsListFiltersSectionProps) {
  const t = useTranslations("Admin.Bookings");
  const styles = bookingsListFiltersSectionVariants();

  return (
    <div className={styles.root({ className })}>
      {BOOKING_STATUS_FILTERS.map((status) => (
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
