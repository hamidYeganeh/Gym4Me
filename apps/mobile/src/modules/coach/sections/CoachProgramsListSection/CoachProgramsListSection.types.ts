import type { CoachProgram } from "../../lib/coach-programs-data";

export type CoachProgramsListSectionProps = {
  programs: CoachProgram[];
  publishingId: string | null;
  onProgramPress: (programId: string) => void;
  onPublishProgram?: (programId: string) => void | Promise<void>;
  className?: string;
};

export const STATE_CHIP_COLOR = {
  published: "success",
  draft: "warning",
  archived: "default",
} as const;

export const STATE_LABEL_KEY = {
  published: "statePublished",
  draft: "stateDraft",
  archived: "stateArchived",
} as const;
