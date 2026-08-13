import type { CoachMessageThread } from "../../lib/coach-messages-data";

export type CoachMessagesScreenProps = {
  threads: CoachMessageThread[];
  className?: string;
};
