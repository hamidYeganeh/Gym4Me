import type {
  CoachLead,
  CoachLeadStage,
  CreateCoachLeadFormInput,
} from "../../lib/coach-leads-data";

export type CoachLeadsScreenProps = {
  leads: CoachLead[];
  error?: string | null;
  creating?: boolean;
  onCreate?: (input: CreateCoachLeadFormInput) => void | Promise<void>;
  updatingId?: string | null;
  onChangeStage?: (leadId: string, stage: CoachLeadStage) => void | Promise<void>;
};
