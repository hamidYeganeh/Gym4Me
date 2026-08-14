"use client";

import { Spinner, Typography } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachProgramEditorScreen } from "../screens/CoachProgramEditorScreen";
import {
  getCoachProgramEditorDetail,
  type CoachProgramEditorDetail,
} from "./coach-program-editor-data";

export function CoachProgramEditorGate({
  programId,
  mode,
}: {
  programId: string;
  mode: "view" | "edit";
}) {
  const { isReady } = useAuth();
  const [program, setProgram] = useState<CoachProgramEditorDetail | null | undefined>(
    undefined,
  );
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    setProgram(getCoachProgramEditorDetail(programId));
  }, [isReady, programId]);

  const onPublish = useCallback(async () => {
    setPublishing(true);
    try {
      setProgram((current) =>
        current ? { ...current, state: "published" } : current,
      );
    } finally {
      setPublishing(false);
    }
  }, []);

  const onAddExercise = useCallback(async (sessionId: string) => {
    setProgram((current) => {
      if (!current) return current;
      return {
        ...current,
        weeks: current.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) => ({
            ...day,
            sessions: day.sessions.map((session) =>
              session.id === sessionId
                ? {
                    ...session,
                    exercises: [
                      ...session.exercises,
                      {
                        id: `e-new-${Date.now()}`,
                        name: "حرکت جدید",
                        sets: "۳",
                        reps: "۱۰",
                      },
                    ],
                  }
                : session,
            ),
          })),
        })),
      };
    });
  }, []);

  if (program === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          برنامه پیدا نشد.
        </Typography>
      </div>
    );
  }

  return (
    <CoachProgramEditorScreen
      mode={mode}
      onAddExercise={mode === "edit" ? onAddExercise : undefined}
      onPublish={program.state === "draft" ? onPublish : undefined}
      program={program}
      publishing={publishing}
    />
  );
}
