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
  const styles = settingsNavGroupSectionVariants();

  if (rows.length === 0) return null;

  return (
    <section className={styles.group({ className })}>
      <Typography className={styles.groupTitle()} type="body-sm">
        {title}
      </Typography>
      <div className={styles.groupCard()}>
        {rows.map((row, index) => (
          <div key={row.key}>
            <Button
              className={styles.rowPressable({ className: styles.row() })}
              fullWidth
              onPress={row.onPress}
              variant="ghost"
            >
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
              <ChevronRight className={styles.rowChevron()} size={18} />
            </Button>
            {index < rows.length - 1 ? (
              <div aria-hidden className={styles.divider()} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
