"use client";

import { Spinner } from "@heroui/react/spinner";
import { useCallback, useEffect, useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachExercisesScreen } from "../screens/CoachExercisesScreen";
import { COACH_EXERCISES, type CoachExercise } from "./coach-exercises-data";
import type { CoachExerciseCreateInput } from "../screens/CoachExercisesScreen/CoachExercisesScreen.types";

export function CoachExercisesGate() {
  const { isReady } = useAuth();
  const [exercises, setExercises] = useState<CoachExercise[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    setExercises(DEMO_MODE ? COACH_EXERCISES : []);
  }, [isReady]);

  const onSubmitExercise = useCallback(
    async (input: CoachExerciseCreateInput) => {
      setSubmitting(true);
      try {
        setExercises((current) => [
          {
            id: `ex-new-${Date.now()}`,
            name: input.name,
            muscleGroup: input.muscleGroup,
            notes: input.notes ?? "—",
            status: "pending",
            updatedLabel: "ارسال همین الان",
          },
          ...(current ?? []),
        ]);
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  if (!exercises) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <CoachExercisesScreen
      exercises={exercises}
      onSubmitExercise={DEMO_MODE ? onSubmitExercise : undefined}
      submitting={submitting}
    />
  );
}
