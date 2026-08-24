import { useTranslations } from "next-intl";
import {
  AdminDatePicker,
  AdminFilterSelect,
  AdminModelAutocomplete,
} from "@/shared/components";
import { bookingsListFiltersSectionVariants } from "./BookingsListFiltersSection.styles";
import {
  BOOKING_BUCKETS,
  BOOKING_RESOURCE_TYPES,
  BOOKING_STATUSES,
  type BookingsListFiltersSectionProps,
} from "./BookingsListFiltersSection.types";

export function BookingsListFiltersSection({
  status,
  bucket,
  resourceType,
  from,
  to,
  athleteId,
  coachUserId,
  clubId,
  onStatusChange,
  onBucketChange,
  onResourceTypeChange,
  onFromChange,
  onToChange,
  onAthleteIdChange,
  onCoachUserIdChange,
  onClubIdChange,
  className,
}: BookingsListFiltersSectionProps) {
  const t = useTranslations("Admin.Bookings");
  const styles = bookingsListFiltersSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.row()}>
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.status")}
          options={BOOKING_STATUSES.map((item) => ({
            value: item,
            label: t(`status.${item}`),
          }))}
          value={status}
          onChange={(value) => onStatusChange(value as typeof status)}
        />
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.bucket")}
          options={BOOKING_BUCKETS.map((item) => ({
            value: item,
            label: t(`bucket.${item}`),
          }))}
          value={bucket}
          onChange={(value) => onBucketChange(value as typeof bucket)}
        />
        <AdminFilterSelect
          allLabel={t("filterAll")}
          label={t("filters.resourceType")}
          options={BOOKING_RESOURCE_TYPES.map((item) => ({
            value: item,
            label: t(`resourceType.${item}`),
          }))}
          value={resourceType}
          onChange={(value) =>
            onResourceTypeChange(value as typeof resourceType)
          }
        />
      </div>

      <div className={styles.row()}>
        <AdminDatePicker
          className={styles.field()}
          label={t("filters.from")}
          labelClassName={styles.label()}
          name="from"
          value={from}
          onChange={onFromChange}
        />
        <AdminDatePicker
          className={styles.field()}
          label={t("filters.to")}
          labelClassName={styles.label()}
          name="to"
          value={to}
          onChange={onToChange}
        />
        <AdminModelAutocomplete
          className={styles.field()}
          kind="athlete"
          label={t("filters.athleteId")}
          value={athleteId}
          onChange={onAthleteIdChange}
        />
        <AdminModelAutocomplete
          className={styles.field()}
          kind="coach"
          label={t("filters.coachUserId")}
          value={coachUserId}
          onChange={onCoachUserIdChange}
        />
        <AdminModelAutocomplete
          className={styles.field()}
          kind="club"
          label={t("filters.clubId")}
          value={clubId}
          onChange={onClubIdChange}
        />
      </div>
    </div>
  );
}
