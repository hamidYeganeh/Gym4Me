import type { CoachLead, CoachLeadStage } from "../../lib/coach-leads-data";

export type CoachLeadsScreenProps = {
  leads: CoachLead[];
  updatingId?: string | null;
  onChangeStage?: (leadId: string, stage: CoachLeadStage) => void | Promise<void>;
};
