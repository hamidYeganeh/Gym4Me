import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { settingsSupportSectionVariants } from "./SettingsSupportSection.styles";
import type { SettingsSupportSectionProps } from "./SettingsSupportSection.types";

export function SettingsSupportSection({
  title,
  aboutLabel,
  versionValue,
  supportRows,
  infoIcon,
  className,
}: SettingsSupportSectionProps) {
  const styles = settingsSupportSectionVariants();

  return (
    <section className={styles.group({ className })}>
      <Typography className={styles.groupTitle()} type="body-sm">
        {title}
      </Typography>
      <div className={styles.groupCard()}>
        {supportRows.map((row) => (
          <Button
            key={row.key}
            className={styles.rowPressable({ className: styles.row() })}
            fullWidth
            onPress={row.onPress}
            variant="ghost"
          >
            <span aria-hidden className={styles.rowIcon()}>
              {row.icon}
            </span>
            <span className={styles.rowBody()}>
              <Typography className={styles.rowLabel()} type="body" weight="medium">
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
        ))}
        <div aria-hidden className={styles.divider()} />
        <div className={styles.row()}>
          <span aria-hidden className={styles.rowIcon()}>
            {infoIcon}
          </span>
          <span className={styles.rowBody()}>
            <Typography className={styles.rowLabel()} type="body" weight="medium">
              {aboutLabel}
            </Typography>
          </span>
          <span className={styles.rowValue()}>{versionValue}</span>
        </div>
      </div>
    </section>
  );
}
