import { Switch } from "@heroui/react/switch";
import { Typography } from "@heroui/react/typography";
import { QuestionMarkCircle } from "@repo/icons/QuestionMarkCircle";
import { useTranslations } from "next-intl";
import { usersDetailStatusSectionVariants } from "./UsersDetailStatusSection.styles";
import type { UsersDetailStatusSectionProps } from "./UsersDetailStatusSection.types";

export function UsersDetailStatusSection({
  user,
  canMutateStatus,
  actionPending,
  onActivate,
  onDeactivate,
  className,
}: UsersDetailStatusSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = usersDetailStatusSectionVariants();
  const isActive = user.status === "active";
  const isDeleted = user.status === "deleted";

  return (
    <section className={styles.root({ className })}>
      <aside className={styles.aside()}>
        <div className={styles.titleRow()}>
          <Typography className={styles.title()} weight="bold">
            {t("detail.accountStatus")}
          </Typography>
          <QuestionMarkCircle
            aria-hidden
            className={styles.helpIcon()}
            size={18}
          />
        </div>
        <Typography className={styles.description()}>
          {t("detail.accountStatusHint")}
        </Typography>
      </aside>

      <div className={styles.card()}>
        <div className={styles.switchRow()}>
          <Switch
            isDisabled={!canMutateStatus || isDeleted || actionPending}
            isSelected={isActive}
            onChange={(selected) => {
              if (selected) onActivate();
              else onDeactivate();
            }}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
          <div className={styles.switchCopy()}>
            <Typography className={styles.switchLabel()}>
              {t("detail.accountActive")}
            </Typography>
            <Typography className={styles.switchHint()}>
              {t("detail.accountActiveHint")}
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}
