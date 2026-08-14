import type { CoachProgramRevision } from "../../lib/coach-program-revisions-data";

export type CoachProgramRevisionsScreenProps = {
  programId: string;
  programTitle: string;
  revisions: CoachProgramRevision[];
};
