import type { ClubLifecycleStatus, ClubOperationalStatus } from "@repo/api";
import { MultiSelectFilter } from "@repo/ui/kit/MultiSelectFilter";
import { useTranslations } from "next-intl";
import { clubsListFiltersSectionVariants } from "./ClubsListFiltersSection.styles";
import type { ClubsListFiltersSectionProps } from "./ClubsListFiltersSection.types";

const LIFECYCLE: ClubLifecycleStatus[] = [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "suspended",
];

const OPERATIONAL: ClubOperationalStatus[] = ["active", "inactive"];

export function ClubsListFiltersSection({
  lifecycleStatus,
  operationalStatus,
  onLifecycleChange,
  onOperationalChange,
  className,
}: ClubsListFiltersSectionProps) {
  const t = useTranslations("Admin.Clubs");
  const styles = clubsListFiltersSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.filters()}>
        <MultiSelectFilter<ClubLifecycleStatus>
          className={styles.filter()}
          label={t("filterLifecycle")}
          options={LIFECYCLE.map((item) => ({
            value: item,
            label: t(`lifecycle.${item}`),
          }))}
          placeholder={t("filterLifecycle")}
          value={lifecycleStatus}
          onChange={onLifecycleChange}
        />

        <MultiSelectFilter<ClubOperationalStatus>
          className={styles.filter()}
          label={t("filterOperational")}
          options={OPERATIONAL.map((item) => ({
            value: item,
            label: t(`operational.${item}`),
          }))}
          placeholder={t("filterOperational")}
          value={operationalStatus}
          onChange={onOperationalChange}
        />
      </div>
    </div>
  );
}
