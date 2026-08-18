import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { coachSlotsManageCreateFormSectionVariants } from "./CoachSlotsManageCreateFormSection.styles";
import type { CoachSlotsManageCreateFormSectionProps } from "./CoachSlotsManageCreateFormSection.types";

export function CoachSlotsManageCreateFormSection({
  title,
  dayLabel,
  timeLabel,
  durationLabel,
  venueLabel,
  venueRemoteLabel,
  noClubsHint,
  createSlotLabel,
  days,
  draftDate,
  draftTime,
  draftDuration,
  draftClubId,
  startTimes,
  durations,
  clubs,
  error = null,
  isCreating = false,
  formatTime,
  formatDuration,
  onDraftDateChange,
  onDraftTimeChange,
  onDraftDurationChange,
  onDraftClubIdChange,
  onCreate,
  className,
}: CoachSlotsManageCreateFormSectionProps) {
  const styles = coachSlotsManageCreateFormSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.title()} type="h4" weight="semibold">
        {title}
      </Typography>

      <div className={styles.fieldGroup()}>
        <Typography className={styles.fieldLabel()} type="body-sm">
          {dayLabel}
        </Typography>
        <FilterChipBar aria-label={dayLabel}>
          {days.map((day) => (
            <FilterChip
              key={day.date}
              onPress={() => onDraftDateChange(day.date)}
              selected={draftDate === day.date}
              selectedVariant="solid"
            >
              {day.label}
            </FilterChip>
          ))}
        </FilterChipBar>
      </div>

      <div className={styles.fieldGroup()}>
        <Typography className={styles.fieldLabel()} type="body-sm">
          {timeLabel}
        </Typography>
        <FilterChipBar aria-label={timeLabel}>
          {startTimes.map((time) => (
            <FilterChip
              key={time}
              onPress={() => onDraftTimeChange(time)}
              selected={draftTime === time}
              selectedVariant="solid"
            >
              {formatTime(time)}
            </FilterChip>
          ))}
        </FilterChipBar>
      </div>

      <div className={styles.fieldGroup()}>
        <Typography className={styles.fieldLabel()} type="body-sm">
          {durationLabel}
        </Typography>
        <FilterChipBar aria-label={durationLabel}>
          {durations.map((minutes) => (
            <FilterChip
              key={minutes}
              onPress={() => onDraftDurationChange(minutes)}
              selected={draftDuration === minutes}
              selectedVariant="solid"
            >
              {formatDuration(minutes)}
            </FilterChip>
          ))}
        </FilterChipBar>
      </div>

      <div className={styles.fieldGroup()}>
        <Typography className={styles.fieldLabel()} type="body-sm">
          {venueLabel}
        </Typography>
        <FilterChipBar aria-label={venueLabel}>
          <FilterChip
            onPress={() => onDraftClubIdChange(null)}
            selected={draftClubId === null}
            selectedVariant="solid"
          >
            {venueRemoteLabel}
          </FilterChip>
          {clubs.map((club) => (
            <FilterChip
              key={club.id}
              onPress={() => onDraftClubIdChange(club.id)}
              selected={draftClubId === club.id}
              selectedVariant="solid"
            >
              {club.name}
            </FilterChip>
          ))}
        </FilterChipBar>
        {clubs.length === 0 ? (
          <Typography className={styles.hint()} type="body-xs">
            {noClubsHint}
          </Typography>
        ) : null}
      </div>

      <Button
        fullWidth
        isPending={isCreating}
        onPress={() => void onCreate()}
        size="lg"
        variant="primary"
      >
        <Plus size={18} />
        {createSlotLabel}
      </Button>

      {error ? (
        <Typography className={styles.errorText()} type="body-sm">
          {error}
        </Typography>
      ) : null}
    </section>
  );
}
