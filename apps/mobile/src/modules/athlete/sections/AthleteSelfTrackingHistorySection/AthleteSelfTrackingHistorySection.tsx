import { Button, Chip, Typography } from "@heroui/react";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteSelfTrackingHistorySectionVariants } from "./AthleteSelfTrackingHistorySection.styles";
import type { AthleteSelfTrackingHistorySectionProps } from "./AthleteSelfTrackingHistorySection.types";

export function AthleteSelfTrackingHistorySection({
  metric,
  items,
  pending = false,
  formatDate,
  onDelete,
  className,
}: AthleteSelfTrackingHistorySectionProps) {
  const styles = athleteSelfTrackingHistorySectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography type="h3" weight="semibold">
        تاریخچهٔ {metric.label}
      </Typography>
      {items.length === 0 ? (
        <div className={styles.empty()}>هنوز چیزی ثبت نشده است.</div>
      ) : (
        <div className={styles.history()}>
          {items.map((item) => (
            <article className={styles.historyRow()} key={item.id}>
              <div className={styles.historyCopy()}>
                <Typography type="body" weight="semibold">
                  {toPersianDigits(item.value)} {metric.unitLabel}
                </Typography>
                <Typography className={styles.meta()} type="body-sm">
                  {formatDate(item.recordedAt)}
                  {item.pending ? " · در انتظار همگام‌سازی" : ""}
                </Typography>
              </div>
              {item.deletable ? (
                <Button
                  isDisabled={pending}
                  onPress={() => void onDelete(item.id)}
                  size="sm"
                  variant="ghost"
                >
                  حذف
                </Button>
              ) : (
                <Chip size="sm" variant="soft">
                  <Chip.Label>صف</Chip.Label>
                </Chip>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
