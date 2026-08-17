import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteWorkoutDetailSessionSectionVariants } from "./AthleteWorkoutDetailSessionSection.styles";
import type { AthleteWorkoutDetailSessionSectionProps } from "./AthleteWorkoutDetailSessionSection.types";

export function AthleteWorkoutDetailSessionSection({
  startSessionLabel,
  activeSessionLabel,
  exerciseLabel,
  repsLabel,
  weightKgLabel,
  addSetLabel,
  noSetsYetLabel,
  completeSessionLabel,
  markCompletedLabel,
  markSkippedLabel,
  logStatusLabel,
  exerciseLabelFor,
  exercises,
  activeSession = null,
  exerciseId,
  reps,
  weightKg,
  pending = false,
  error = null,
  onStartSession,
  onAddSet,
  onCompleteSession,
  onLogSession,
  onExerciseIdChange,
  onRepsChange,
  onWeightKgChange,
  className,
}: AthleteWorkoutDetailSessionSectionProps) {
  const styles = athleteWorkoutDetailSessionSectionVariants();

  return (
    <section className={styles.root({ className })}>
      {onStartSession ? (
        <Button
          isDisabled={pending}
          onPress={() => void onStartSession()}
          variant="primary"
        >
          {startSessionLabel}
        </Button>
      ) : null}

      {activeSession ? (
        <div className={styles.sessionCard()}>
          <div className={styles.cardTop()}>
            <Typography type="body" weight="semibold">
              {activeSessionLabel}
            </Typography>
            <Chip color="warning" size="sm" variant="soft">
              <Chip.Label>{logStatusLabel(activeSession.status)}</Chip.Label>
            </Chip>
          </div>

          {exercises.length > 0 && onAddSet ? (
            <div className={styles.sessionForm()}>
              <label className={styles.field()}>
                <span className={styles.meta()}>{exerciseLabel}</span>
                <select
                  className={styles.nativeSelect()}
                  onChange={(event) => onExerciseIdChange(event.target.value)}
                  value={exerciseId}
                >
                  {exercises.map((exercise) => (
                    <option
                      key={exercise.exerciseId}
                      value={exercise.exerciseId}
                    >
                      {exercise.label}
                      {exercise.plannedReps
                        ? ` · ${toPersianDigits(exercise.plannedSets)}×${toPersianDigits(exercise.plannedReps)}`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.sessionGrid()}>
                <TextField>
                  <Label>{repsLabel}</Label>
                  <Input
                    inputMode="numeric"
                    min={1}
                    onChange={(event) => onRepsChange(event.target.value)}
                    type="number"
                    value={reps}
                  />
                </TextField>
                <TextField>
                  <Label>{weightKgLabel}</Label>
                  <Input
                    inputMode="decimal"
                    min={0}
                    onChange={(event) => onWeightKgChange(event.target.value)}
                    type="number"
                    value={weightKg}
                  />
                </TextField>
              </div>
              <Button
                isDisabled={
                  pending ||
                  !exerciseId ||
                  !Number.isFinite(Number(reps)) ||
                  Number(reps) <= 0
                }
                onPress={() =>
                  void onAddSet({
                    exerciseId,
                    reps: Number(reps),
                    weightKg:
                      weightKg.trim() === "" ? undefined : Number(weightKg),
                  })
                }
                variant="secondary"
              >
                {addSetLabel}
              </Button>
            </div>
          ) : null}

          {activeSession.sets.length > 0 ? (
            <div className={styles.setList()}>
              {activeSession.sets.map((set, index) => (
                <Typography
                  className={styles.meta()}
                  key={`${set.exerciseId}-${index}`}
                  type="body-sm"
                >
                  {toPersianDigits(index + 1)}. {exerciseLabelFor(set.exerciseId)}{" "}
                  · {toPersianDigits(set.reps)} تکرار
                  {set.weightKg != null
                    ? ` · ${toPersianDigits(set.weightKg)} کیلوگرم`
                    : ""}
                </Typography>
              ))}
            </div>
          ) : (
            <Typography className={styles.meta()} type="body-sm">
              {noSetsYetLabel}
            </Typography>
          )}

          {onCompleteSession ? (
            <Button
              isDisabled={pending}
              onPress={() => void onCompleteSession()}
              variant="primary"
            >
              {completeSessionLabel}
            </Button>
          ) : null}
        </div>
      ) : null}

      {onLogSession && !activeSession ? (
        <div className={styles.quickLog()}>
          <Button
            isDisabled={pending}
            onPress={() => void onLogSession("completed")}
            variant="outline"
          >
            {markCompletedLabel}
          </Button>
          <Button
            isDisabled={pending}
            onPress={() => void onLogSession("skipped")}
            variant="outline"
          >
            {markSkippedLabel}
          </Button>
        </div>
      ) : null}

      {error ? <p className={styles.error()}>{error}</p> : null}
    </section>
  );
}
