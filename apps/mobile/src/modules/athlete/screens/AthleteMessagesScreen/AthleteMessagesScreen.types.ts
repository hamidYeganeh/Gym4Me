import type { AthleteMessageThread } from "../../lib/athlete-messages-data";

export type AthleteMessagesScreenProps = {
  threads: AthleteMessageThread[];
  className?: string;
};
