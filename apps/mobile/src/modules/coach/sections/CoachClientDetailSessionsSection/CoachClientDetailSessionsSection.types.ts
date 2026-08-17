import type { CoachClientSession } from "../../lib/coach-clients-data";

export type CoachClientDetailSessionsSectionProps = {
  title: string;
  sessions: CoachClientSession[];
  emptyMessage?: string;
};
