import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteSelfTrackingSummarySectionVariants } from "./AthleteSelfTrackingSummarySection.styles";
import type { AthleteSelfTrackingSummarySectionProps } from "./AthleteSelfTrackingSummarySection.types";

export function AthleteSelfTrackingSummarySection({
  summary,
  unitLabel,
  formatSummaryValue,
  formatDate,
  className,
}: AthleteSelfTrackingSummarySectionProps) {
  const styles = athleteSelfTrackingSummarySectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Chip size="sm" variant="soft">
        <Chip.Label>
          خلاصه: {formatSummaryValue(summary.value, unitLabel)}
        </Chip.Label>
      </Chip>
      <Typography className={styles.meta()} type="body-sm">
        {toPersianDigits(summary.sampleCount)} نمونه
        {summary.latestRecordedAt
          ? ` · آخرین ${formatDate(summary.latestRecordedAt)}`
          : ""}
      </Typography>
    </section>
  );
}
