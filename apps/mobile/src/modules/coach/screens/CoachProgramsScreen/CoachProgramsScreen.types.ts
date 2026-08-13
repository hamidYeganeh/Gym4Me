import type { CoachProgram } from "../../lib/coach-programs-data";

export type CoachProgramCreateInput = {
  title: string;
  focusLabel?: string;
  weekCount?: number;
  sessionsPerWeek?: number;
};

export type CoachProgramsScreenProps = {
  programs: CoachProgram[];
  creating?: boolean;
  createError?: string | null;
  onCreateProgram?: (input: CoachProgramCreateInput) => void | Promise<void>;
  onPublishProgram?: (programId: string) => void | Promise<void>;
};
