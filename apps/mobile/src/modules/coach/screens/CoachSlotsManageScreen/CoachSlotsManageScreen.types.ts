export type CoachSlotsManageScreenProps = Record<string, never>;

export type SlotDraft = {
  /** ISO date `YYYY-MM-DD`. */
  date: string;
  /** `HH:mm` 24h. */
  startTime: string;
  durationMinutes: number;
  clubId: string | null;
};
