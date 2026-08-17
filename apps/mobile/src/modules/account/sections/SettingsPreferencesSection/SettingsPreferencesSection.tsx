import { Button, Typography } from "@heroui/react";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { AnimatedThemeToggler } from "@/shared/components/animated-theme-toggler";
import { settingsPreferencesSectionVariants } from "./SettingsPreferencesSection.styles";
import type { SettingsPreferencesSectionProps } from "./SettingsPreferencesSection.types";

export function SettingsPreferencesSection({
  title,
  notificationsLabel,
  notificationsHint,
  themeLabel,
  themeHint,
  themeAriaLabel,
  languageLabel,
  languageValue,
  icons,
  onNotificationsPress,
  className,
}: SettingsPreferencesSectionProps) {
  const styles = settingsPreferencesSectionVariants();

  return (
    <section className={styles.group({ className })}>
      <Typography className={styles.groupTitle()} type="body-sm">
        {title}
      </Typography>
      <div className={styles.groupCard()}>
        <Button
          className={styles.rowPressable({ className: styles.row() })}
          fullWidth
          onPress={onNotificationsPress}
          variant="ghost"
        >
          <span aria-hidden className={styles.rowIcon()}>
            {icons.bell}
          </span>
          <span className={styles.rowBody()}>
            <Typography className={styles.rowLabel()} type="body" weight="medium">
              {notificationsLabel}
            </Typography>
            <Typography className={styles.rowHint()} type="body-sm">
              {notificationsHint}
            </Typography>
          </span>
          <ChevronRight className={styles.rowChevron()} size={18} />
        </Button>

        <div aria-hidden className={styles.divider()} />

        <div className={styles.row()}>
          <span aria-hidden className={styles.rowIcon()}>
            {icons.moon}
          </span>
          <span className={styles.rowBody()}>
            <Typography className={styles.rowLabel()} type="body" weight="medium">
              {themeLabel}
            </Typography>
            <Typography className={styles.rowHint()} type="body-sm">
              {themeHint}
            </Typography>
          </span>
          <AnimatedThemeToggler aria-label={themeAriaLabel} />
        </div>

        <div aria-hidden className={styles.divider()} />

        <div className={styles.row()}>
          <span aria-hidden className={styles.rowIcon()}>
            {icons.globe}
          </span>
          <span className={styles.rowBody()}>
            <Typography className={styles.rowLabel()} type="body" weight="medium">
              {languageLabel}
            </Typography>
          </span>
          <span className={styles.rowValue()}>{languageValue}</span>
        </div>
      </div>
    </section>
  );
}
