import type { CoachDetailProgram } from "../../lib/coach-detail-data";

export type DiscoveryCoachesDetailProgramsSectionProps = {
  programs: CoachDetailProgram[];
  onToggleDone?: (programId: string) => void;
  onAddProgram?: () => void;
};
