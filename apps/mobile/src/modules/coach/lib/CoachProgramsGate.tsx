"use client";

import { Spinner } from "@heroui/react/spinner";
import type { WorkoutProgram } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
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
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const page = await accountProgress.listWorkoutPrograms({ page_size: 100 });
    setPrograms(
      page.result.length > 0 ? page.result.map(mapProgram) : COACH_PROGRAMS,
    );
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setPrograms(COACH_PROGRAMS);
      return;
    }

    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setPrograms(COACH_PROGRAMS);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, load]);

  const onCreateProgram = useCallback(
    async (input: {
      title: string;
      focusLabel?: string;
      weekCount?: number;
      sessionsPerWeek?: number;
    }) => {
      if (!isAuthenticated) return;
      setCreating(true);
      setCreateError(null);
      try {
        await accountProgress.createWorkoutProgram({
          title: input.title.trim(),
          status: "draft",
          meta: {
            focusLabel: input.focusLabel?.trim() || undefined,
            weekCount: input.weekCount,
            sessionsPerWeek: input.sessionsPerWeek,
          },
        });
        await load();
      } catch {
        setCreateError("createError");
        throw new Error("create failed");
      } finally {
        setCreating(false);
      }
    },
    [isAuthenticated, load],
  );

  const onPublishProgram = useCallback(
    async (programId: string) => {
      if (!isAuthenticated) return;
      await accountProgress.updateWorkoutProgram(programId, {
        status: "published",
      });
      await load();
    },
    [isAuthenticated, load],
  );

  if (!programs) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <CoachProgramsScreen
      createError={createError}
      creating={creating}
      onCreateProgram={isAuthenticated ? onCreateProgram : undefined}
      onPublishProgram={isAuthenticated ? onPublishProgram : undefined}
      programs={programs}
    />
  );
}
