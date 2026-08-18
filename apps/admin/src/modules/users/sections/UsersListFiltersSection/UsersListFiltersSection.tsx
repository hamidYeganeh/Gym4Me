import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import type { Role, UserStatus } from "@repo/api";
import { MultiSelectFilter } from "@repo/ui/kit/MultiSelectFilter";
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
        <MultiSelectFilter<UserStatus>
          className={styles.filter()}
          label={t("filterStatus")}
          options={USER_STATUSES.map((item) => ({
            value: item,
            label: t(`status.${item}`),
          }))}
          placeholder={t("filterStatus")}
          value={status}
          onChange={onStatusChange}
        />

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
