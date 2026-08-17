import type { CoachProgramState } from "../../lib/coach-programs-data";

export type ProgramFilter = "all" | CoachProgramState;

export type CoachProgramsFiltersSectionProps = {
  filter: ProgramFilter;
  onFilterChange: (value: ProgramFilter) => void;
  className?: string;
};

export const PROGRAM_FILTERS: ProgramFilter[] = [
  "all",
  "published",
  "draft",
  "archived",
];

export const PROGRAM_FILTER_LABEL_KEY: Record<ProgramFilter, string> = {
  all: "filterAll",
  published: "filterPublished",
  draft: "filterDraft",
  archived: "filterArchived",
};
