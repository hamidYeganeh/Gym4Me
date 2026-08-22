import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { useTranslations } from "next-intl";
import { AdminFilterSelect } from "@/shared/components";
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
        <TextField
          className={styles.field()}
          name="from"
          type="date"
          value={from}
          onChange={onFromChange}
        >
          <Label className={styles.label()}>{t("filters.from")}</Label>
          <Input className={styles.input()} />
        </TextField>
        <TextField
          className={styles.field()}
          name="to"
          type="date"
          value={to}
          onChange={onToChange}
        >
          <Label className={styles.label()}>{t("filters.to")}</Label>
          <Input className={styles.input()} />
        </TextField>
        <TextField
          className={styles.field()}
          name="athleteId"
          value={athleteId}
          onChange={onAthleteIdChange}
        >
          <Label className={styles.label()}>{t("filters.athleteId")}</Label>
          <Input
            className={styles.input()}
            dir="ltr"
            placeholder={t("filters.idPlaceholder")}
          />
        </TextField>
        <TextField
          className={styles.field()}
          name="coachUserId"
          value={coachUserId}
          onChange={onCoachUserIdChange}
        >
          <Label className={styles.label()}>{t("filters.coachUserId")}</Label>
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
    </div>
  );
}
