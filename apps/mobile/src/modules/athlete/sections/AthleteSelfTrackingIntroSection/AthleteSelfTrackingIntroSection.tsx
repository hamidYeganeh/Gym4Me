import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { athleteSelfTrackingIntroSectionVariants } from "./AthleteSelfTrackingIntroSection.styles";
import type { AthleteSelfTrackingIntroSectionProps } from "./AthleteSelfTrackingIntroSection.types";

export function AthleteSelfTrackingIntroSection({
  onGoalsPress,
  onHealthSyncPress,
  className,
}: AthleteSelfTrackingIntroSectionProps) {
  const styles = athleteSelfTrackingIntroSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography type="h1" weight="bold">
        ثبت فعالیت و سلامت
      </Typography>
      <Typography className={styles.subtitle()} type="body">
        آب، خواب، پیاده‌روی، وزن و رکوردهای ورزشی خودت را در یک تاریخچهٔ
        خصوصی نگه دار.
      </Typography>
      <div className={styles.actions()}>
        <Button onPress={onGoalsPress} size="sm" variant="secondary">
          اهداف و یادآوری
        </Button>
        <Button onPress={onHealthSyncPress} size="sm" variant="tertiary">
          همگام‌سازی دستگاه
        </Button>
      </div>
    </section>
  );
}
