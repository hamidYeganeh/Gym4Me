"use client";

import { Spinner } from "@heroui/react";
import type { WorkoutProgram } from "@repo/api";
import { useEffect, useState } from "react";
import { accountProgress } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachProgramsScreen } from "../screens/CoachProgramsScreen";
import {
  COACH_PROGRAMS,
  type CoachProgram,
  type CoachProgramState,
} from "./coach-programs-data";

function mapProgram(program: WorkoutProgram): CoachProgram {
  const status = program.status as CoachProgramState;
  return {
    id: program.id,
    title: program.title,
    focusLabel: program.meta.focusLabel ?? "—",
    weeks: program.meta.weekCount != null ? String(program.meta.weekCount) : "—",
    sessionsPerWeek:
      program.meta.sessionsPerWeek != null
        ? String(program.meta.sessionsPerWeek)
        : "—",
    assignedCount: String(program.assignedCount),
    state: status,
    updatedLabel: new Date(program.updatedAt).toLocaleDateString("fa-IR"),
  };
}

export function CoachProgramsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [programs, setPrograms] = useState<CoachProgram[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setPrograms(COACH_PROGRAMS);
      return;
    }

    let cancelled = false;
    accountProgress
      .listWorkoutPrograms({ page_size: 100 })
      .then((page) => {
        if (cancelled) return;
        setPrograms(
          page.result.length > 0
            ? page.result.map(mapProgram)
            : COACH_PROGRAMS,
        );
      })
      .catch(() => {
        if (!cancelled) setPrograms(COACH_PROGRAMS);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!programs) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <CoachProgramsScreen programs={programs} />;
}
