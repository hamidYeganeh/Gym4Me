import type { Waitlist } from "@repo/api";

export type AthleteWaitlistScreenProps = {
  items: Waitlist[];
  pendingId?: string | null;
  onLeave?: (waitlistId: string) => Promise<void> | void;
  onClaim?: (waitlistId: string, entryId: string) => Promise<void> | void;
  className?: string;
};
