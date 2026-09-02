import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { settingsNavGroupSectionVariants } from "./SettingsNavGroupSection.styles";
import type { SettingsNavGroupSectionProps } from "./SettingsNavGroupSection.types";

export function SettingsNavGroupSection({
  title,
  rows,
  className,
}: SettingsNavGroupSectionProps) {
  const base = settingsNavGroupSectionVariants();

  if (rows.length === 0) return null;

  return (
    <section className={base.group({ className })}>
      <Typography className={base.groupTitle()} type="body-sm">
        {title}
      </Typography>
      <div className={base.groupCard()}>
        {rows.map((row, index) => {
          const isDisabled = Boolean(row.isDisabled) || !row.onPress;
          const styles = settingsNavGroupSectionVariants();
          const content = (
            <>
              <span aria-hidden className={styles.rowIcon()}>
                {row.icon}
              </span>
              <span className={styles.rowBody()}>
                <Typography
                  className={styles.rowLabel()}
                  type="body"
                  weight="medium"
                >
                  {row.label}
                </Typography>
                {row.hint ? (
                  <Typography className={styles.rowHint()} type="body-sm">
                    {row.hint}
                  </Typography>
                ) : null}
              </span>
              {!isDisabled ? (
                <ChevronRight className={styles.rowChevron()} size={18} />
              ) : null}
            </>
          );

          return (
            <div key={row.key}>
              {isDisabled ? (
                <div aria-disabled className={styles.row()}>
                  {content}
                </div>
              ) : (
                <Button
                  className={styles.rowPressable({ className: styles.row() })}
                  fullWidth
                  onPress={row.onPress}
                  variant="ghost"
                 size="lg">
                  {content}
                </Button>
              )}
              {index < rows.length - 1 ? (
                <div aria-hidden className={styles.divider()} />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
