import { Label, ListBox, Select } from "@heroui/react";
import type { ClubLifecycleStatus, ClubOperationalStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { clubsListFiltersSectionVariants } from "./ClubsListFiltersSection.styles";
import type {
  ClubsListFiltersSectionProps,
  SelectChangeValue,
} from "./ClubsListFiltersSection.types";

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
        <Select
          className={styles.filter()}
          placeholder={t("filterLifecycle")}
          value={lifecycleStatus}
          onChange={(value: SelectChangeValue) => {
            onLifecycleChange(
              String(value ?? "all") as ClubLifecycleStatus | "all",
            );
          }}
        >
          <Label className={styles.label()}>{t("filterLifecycle")}</Label>
          <Select.Trigger className={styles.trigger()}>
            <Select.Value className={styles.value()} />
            <Select.Indicator className={styles.indicator()} />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="all" textValue={t("filterAll")}>
                {t("filterAll")}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              {LIFECYCLE.map((item) => (
                <ListBox.Item
                  key={item}
                  id={item}
                  textValue={t(`lifecycle.${item}`)}
                >
                  {t(`lifecycle.${item}`)}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          className={styles.filter()}
          placeholder={t("filterOperational")}
          value={operationalStatus}
          onChange={(value: SelectChangeValue) => {
            onOperationalChange(
              String(value ?? "all") as ClubOperationalStatus | "all",
            );
          }}
        >
          <Label className={styles.label()}>{t("filterOperational")}</Label>
          <Select.Trigger className={styles.trigger()}>
            <Select.Value className={styles.value()} />
            <Select.Indicator className={styles.indicator()} />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="all" textValue={t("filterAll")}>
                {t("filterAll")}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              {OPERATIONAL.map((item) => (
                <ListBox.Item
                  key={item}
                  id={item}
                  textValue={t(`operational.${item}`)}
                >
                  {t(`operational.${item}`)}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </div>
  );
}
