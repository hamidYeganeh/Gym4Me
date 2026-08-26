import type { CoachClient } from "../../lib/coach-clients-data";

export type CoachClientsScreenProps = {
  clients: CoachClient[];
  initialFilter?: "all" | "at-risk";
  followingUpId?: string | null;
  followUpError?: string | null;
  onFollowUp?: (client: CoachClient) => void;
};
