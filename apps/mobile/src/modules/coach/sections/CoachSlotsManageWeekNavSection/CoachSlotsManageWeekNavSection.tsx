import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { coachSlotsManageWeekNavSectionVariants } from "./CoachSlotsManageWeekNavSection.styles";
import type { CoachSlotsManageWeekNavSectionProps } from "./CoachSlotsManageWeekNavSection.types";

export function CoachSlotsManageWeekNavSection({
  rangeLabel,
  prevWeekLabel,
  nextWeekLabel,
  onPrevWeek,
  onNextWeek,
  className,
}: CoachSlotsManageWeekNavSectionProps) {
  const styles = coachSlotsManageWeekNavSectionVariants();

  return (
    <div className={styles.root({ className })}>
      <Typography className={styles.label()} weight="bold">
        {rangeLabel}
      </Typography>
      <div className={styles.nav()}>
        <Button
          aria-label={prevWeekLabel}
          className={styles.button()}
          isIconOnly
          onPress={onPrevWeek}
          size="lg"
        >
          <ChevronRight
            aria-hidden
            className={styles.buttonIcon()}
            rtlMirror={false}
            size={18}
          />
        </Button>
        <Button
          aria-label={nextWeekLabel}
          className={styles.button()}
          isIconOnly
          onPress={onNextWeek}
          size="lg"
        >
          <ChevronLeft
            aria-hidden
            className={styles.buttonIcon()}
            rtlMirror={false}
            size={18}
          />
        </Button>
      </div>
    </div>
  );
}
