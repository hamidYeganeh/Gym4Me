import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteSelfTrackingPendingSectionVariants } from "./AthleteSelfTrackingPendingSection.styles";
import type { AthleteSelfTrackingPendingSectionProps } from "./AthleteSelfTrackingPendingSection.types";

export function AthleteSelfTrackingPendingSection({
  count,
  pending = false,
  onFlushPending,
  className,
}: AthleteSelfTrackingPendingSectionProps) {
  const styles = athleteSelfTrackingPendingSectionVariants();

  if (count <= 0) return null;

  return (
    <section className={styles.root({ className })}>
      <div className={styles.copy()}>
        <Typography type="body" weight="semibold">
          {toPersianDigits(count)} مورد در صف همگام‌سازی
        </Typography>
        <Typography className={styles.meta()} type="body-sm">
          ثبت‌های آفلاین پس از اتصال اینترنت ارسال می‌شوند.
        </Typography>
      </div>
      {onFlushPending ? (
        <Button
          isDisabled={pending}
          onPress={() => void onFlushPending()}
          size="sm"
          variant="secondary"
        >
          تلاش مجدد
        </Button>
      ) : null}
    </section>
  );
}
