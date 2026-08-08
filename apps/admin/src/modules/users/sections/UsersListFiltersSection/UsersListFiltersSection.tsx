import { Label, ListBox, Select } from "@heroui/react";
import type { Role, UserStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { USER_ROLES, USER_STATUSES } from "@/shared/lib/user-format";
import { usersListFiltersSectionVariants } from "./UsersListFiltersSection.styles";
import type {
  SelectChangeValue,
  UsersListFiltersSectionProps,
} from "./UsersListFiltersSection.types";

export function UsersListFiltersSection({
  status,
  role,
  onStatusChange,
  onRoleChange,
  className,
}: UsersListFiltersSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = usersListFiltersSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.filters()}>
        <Select
          className={styles.filter()}
          placeholder={t("filterStatus")}
          value={status}
          onChange={(value: SelectChangeValue) => {
            onStatusChange(String(value ?? "all") as UserStatus | "all");
          }}
        >
          <Label className={styles.label()}>{t("filterStatus")}</Label>
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
              {USER_STATUSES.map((item) => (
                <ListBox.Item
                  key={item}
                  id={item}
                  textValue={t(`status.${item}`)}
                >
                  {t(`status.${item}`)}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          className={styles.filter()}
          placeholder={t("filterRole")}
          value={role}
          onChange={(value: SelectChangeValue) => {
            onRoleChange(String(value ?? "all") as Role | "all");
          }}
        >
          <Label className={styles.label()}>{t("filterRole")}</Label>
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
              {USER_ROLES.map((item) => (
                <ListBox.Item
                  key={item}
                  id={item}
                  textValue={t(`roles.${item}`)}
                >
                  {t(`roles.${item}`)}
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
