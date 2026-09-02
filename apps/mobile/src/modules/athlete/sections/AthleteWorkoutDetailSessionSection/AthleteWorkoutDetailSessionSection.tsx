import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteWorkoutDetailSessionSectionVariants } from "./AthleteWorkoutDetailSessionSection.styles";
import type { AthleteWorkoutDetailSessionSectionProps } from "./AthleteWorkoutDetailSessionSection.types";

export function AthleteWorkoutDetailSessionSection({
  startSessionLabel,
  activeSessionLabel,
  exerciseLabel,
  repsLabel,
  weightKgLabel,
  durationSecLabel,
  distanceMLabel,
  rpeLabel,
  painScoreLabel,
  painAreasLabel,
  painAreasHint,
  sessionNoteLabel,
  saveSessionDetailsLabel,
  addSetLabel,
  saveSetLabel,
  editSetLabel,
  removeSetLabel,
  cancelEditLabel,
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
  durationSec,
  distanceM,
  rpe,
  painScore,
  painAreas,
  sessionNote,
  pending = false,
  error = null,
  onStartSession,
  onAddSet,
  editingSetIndex = null,
  onEditSet,
  onRemoveSet,
  onCancelEdit,
  onCompleteSession,
  onSaveSessionDetails,
  onLogSession,
  onExerciseIdChange,
  onRepsChange,
  onWeightKgChange,
  onDurationSecChange,
  onDistanceMChange,
  onRpeChange,
  onPainScoreChange,
  onPainAreasChange,
  onSessionNoteChange,
  className,
}: AthleteWorkoutDetailSessionSectionProps) {
  const styles = athleteWorkoutDetailSessionSectionVariants();

  return (
    <section className={styles.root({ className })}>
      {onStartSession ? (
        <Button size="lg"
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
                  <Label>{durationSecLabel}</Label>
                  <Input
                    inputMode="numeric"
                    min={0}
                    onChange={(event) => onDurationSecChange(event.target.value)}
                    type="number"
                    value={durationSec}
                  />
                </TextField>
                <TextField>
                  <Label>{distanceMLabel}</Label>
                  <Input
                    inputMode="decimal"
                    min={0}
                    onChange={(event) => onDistanceMChange(event.target.value)}
                    type="number"
                    value={distanceM}
                  />
                </TextField>
                <TextField>
                  <Label>{rpeLabel}</Label>
                  <Input
                    inputMode="decimal"
                    max={10}
                    min={1}
                    onChange={(event) => onRpeChange(event.target.value)}
                    type="number"
                    value={rpe}
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
                  Number(reps) <= 0 ||
                  (weightKg.trim() !== "" &&
                    (!Number.isFinite(Number(weightKg)) ||
                      Number(weightKg) < 0)) ||
                  (durationSec.trim() !== "" &&
                    (!Number.isInteger(Number(durationSec)) ||
                      Number(durationSec) < 0)) ||
                  (distanceM.trim() !== "" &&
                    (!Number.isFinite(Number(distanceM)) ||
                      Number(distanceM) < 0)) ||
                  (rpe.trim() !== "" &&
                    (!Number.isFinite(Number(rpe)) ||
                      Number(rpe) < 1 ||
                      Number(rpe) > 10))
                }
                onPress={() =>
                  void onAddSet({
                    exerciseId,
                    reps: Number(reps),
                    weightKg:
                      weightKg.trim() === "" ? undefined : Number(weightKg),
                    durationSec:
                      durationSec.trim() === ""
                        ? undefined
                        : Number(durationSec),
                    distanceM:
                      distanceM.trim() === "" ? undefined : Number(distanceM),
                    rpe: rpe.trim() === "" ? undefined : Number(rpe),
                  })
                }
                size="lg"
                variant="secondary"
              >
                {editingSetIndex == null ? addSetLabel : saveSetLabel}
              </Button>
              {editingSetIndex != null ? (
                <Button onPress={onCancelEdit} variant="ghost" size="lg">
                  {cancelEditLabel}
                </Button>
              ) : null}
            </div>
          ) : null}

          {activeSession.sets.length > 0 ? (
            <div className={styles.setList()}>
              {activeSession.sets.map((set, index) => (
                <div className="rounded-xl border border-divider p-2" key={`${set.exerciseId}-${index}`}>
                  <Typography className={styles.meta()} type="body-sm">
                    {toPersianDigits(index + 1)}. {exerciseLabelFor(set.exerciseId)}{" "}
                    · {toPersianDigits(set.reps)} تکرار
                    {set.weightKg != null ? ` · ${toPersianDigits(set.weightKg)} کیلوگرم` : ""}
                    {set.durationSec != null ? ` · ${toPersianDigits(set.durationSec)} ثانیه` : ""}
                    {set.distanceM != null ? ` · ${toPersianDigits(set.distanceM)} متر` : ""}
                    {set.rpe != null ? ` · RPE ${toPersianDigits(set.rpe)}` : ""}
                  </Typography>
                  <div className="mt-2 flex gap-2">
                    <Button isDisabled={pending} onPress={() => onEditSet?.(index)} size="lg" variant="ghost">{editSetLabel}</Button>
                    <Button className="text-danger" isDisabled={pending} onPress={() => void onRemoveSet?.(index)} size="lg" variant="ghost">{removeSetLabel}</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography className={styles.meta()} type="body-sm">
              {noSetsYetLabel}
            </Typography>
          )}

          {onSaveSessionDetails ? (
            <div className={styles.sessionForm()}>
              <div className={styles.sessionGrid()}>
                <TextField>
                  <Label>{painScoreLabel}</Label>
                  <Input
                    inputMode="decimal"
                    max={10}
                    min={0}
                    onChange={(event) => onPainScoreChange(event.target.value)}
                    type="number"
                    value={painScore}
                  />
                </TextField>
                <TextField>
                  <Label>{painAreasLabel}</Label>
                  <Input
                    aria-describedby="workout-pain-areas-hint"
                    onChange={(event) => onPainAreasChange(event.target.value)}
                    value={painAreas}
                  />
                </TextField>
              </div>
              <Typography
                className={styles.meta()}
                id="workout-pain-areas-hint"
                type="body-sm"
              >
                {painAreasHint}
              </Typography>
              <TextField>
                <Label>{sessionNoteLabel}</Label>
                <Input
                  onChange={(event) => onSessionNoteChange(event.target.value)}
                  value={sessionNote}
                />
              </TextField>
              <Button
                isDisabled={
                  pending ||
                  (painScore.trim() !== "" &&
                    (!Number.isFinite(Number(painScore)) ||
                      Number(painScore) < 0 ||
                      Number(painScore) > 10))
                }
                onPress={() =>
                  void onSaveSessionDetails({
                    note: sessionNote.trim() || undefined,
                    pain:
                      painScore.trim() === "" && painAreas.trim() === ""
                        ? undefined
                        : {
                            score:
                              painScore.trim() === ""
                                ? undefined
                                : Number(painScore),
                            bodyAreaKeys: painAreas
                              .split(/[،,]/)
                              .map((item) => item.trim())
                              .filter(Boolean),
                          },
                  })
                }
                size="lg"
                variant="secondary"
              >
                {saveSessionDetailsLabel}
              </Button>
            </div>
          ) : null}

          {onCompleteSession ? (
            <Button size="lg"
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
          <Button size="lg"
            isDisabled={pending}
            onPress={() => void onLogSession("completed")}
            variant="outline"
          >
            {markCompletedLabel}
          </Button>
          <Button size="lg"
            isDisabled={pending}
            onPress={() => void onLogSession("skipped")}
            variant="outline"
          >
            {markSkippedLabel}
          </Button>
        </div>
      ) : null}

      {error ? (
        <Typography className={styles.error()} type="body-sm">
          {error}
        </Typography>
      ) : null}
    </section>
  );
}
